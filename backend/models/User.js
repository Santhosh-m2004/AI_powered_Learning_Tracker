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
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
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

// Remove sensitive information from JSON response
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'streak.lastActive': -1 });

// Virtual for total learning time (if you want to track this)
userSchema.virtual('totalLearningTime').get(function() {
  // This would be populated by aggregating LearningSession data
  return 0;
});

export default mongoose.model('User', userSchema);