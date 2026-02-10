import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: {
    type: String
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  
  streak: {
    current: { 
      type: Number, 
      default: 0 
    },
    longest: { 
      type: Number, 
      default: 0 
    },
    lastActive: { 
      type: Date,
      default: null
    }
  },
  preferences: {
    dailyGoal: { 
      type: Number, 
      default: 120,
      min: [15, 'Daily goal must be at least 15 minutes'],
      max: [480, 'Daily goal cannot exceed 8 hours (480 minutes)']
    }, // minutes
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'auto'],
      default: 'light' 
    },
    notifications: { 
      type: Boolean, 
      default: true 
    }
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [200, 'Bio cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified and user is local
  if (!this.isModified('password') || this.provider !== 'local') return next();
  
  if (!this.password) {
    return next(new Error('Password is required for local authentication'));
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = this.streak.lastActive ? 
    new Date(this.streak.lastActive).setHours(0, 0, 0, 0) : null;
  
  if (!lastActive) {
    // First time activity
    this.streak.current = 1;
  } else {
    const diffTime = today - lastActive;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      this.streak.current += 1;
    } else if (diffDays > 1) {
      // Streak broken
      this.streak.current = 1;
    }
    // diffDays === 0 means already active today
  }
  
  this.streak.lastActive = today;
  this.streak.longest = Math.max(this.streak.longest, this.streak.current);
  
  return await this.save();
};

// Static method for OAuth find or create
userSchema.statics.findOrCreate = async function(profile) {
  let user = await this.findOne({ 
    $or: [
      { email: profile.email },
      { googleId: profile.googleId }
    ]
  });

  if (!user) {
    // Create new user
    user = new this({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      avatar: profile.avatar,
      provider: 'google'
    });
    await user.save();
  } else {
    // Update existing user with OAuth info if needed
    if (profile.googleId && !user.googleId) user.googleId = profile.googleId;
    if (profile.avatar && !user.avatar) user.avatar = profile.avatar;
    user.provider = 'google';
    await user.save();
  }

  return user;
};

// Remove sensitive information from JSON response
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.googleId;
    return ret;
  }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ 'streak.lastActive': -1 });

// Virtual for total learning time
userSchema.virtual('totalLearningTime').get(function() {
  return 0;
});

export default mongoose.model('User', userSchema);