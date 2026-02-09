import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  tasks: [{
    subject: {
      type: String,
      required: [true, 'Task subject is required'],
      trim: true
    },
    topic: {
      type: String,
      required: [true, 'Task topic is required'],
      trim: true
    },
    estimatedTime: {
      type: Number, // minutes
      required: [true, 'Estimated time is required'],
      min: [5, 'Estimated time must be at least 5 minutes']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    notes: {
      type: String,
      trim: true
    }
  }],
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  sourcePlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan'
  }
}, {
  timestamps: true
});

// Auto-calculate progress before saving
studyPlanSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.completed).length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
    
    // Update status based on progress
    if (this.progress === 100) {
      this.status = 'completed';
    } else if (this.progress > 0) {
      this.status = 'in-progress';
    } else {
      this.status = 'pending';
    }
  } else {
    this.progress = 0;
    this.status = 'pending';
  }
  next();
});

// Indexes for efficient queries
studyPlanSchema.index({ user: 1, date: -1 });
studyPlanSchema.index({ user: 1, status: 1 });
studyPlanSchema.index({ user: 1, type: 1 });

// Virtual for total estimated time
studyPlanSchema.virtual('totalEstimatedTime').get(function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  return this.tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
});

// Virtual for completed time
studyPlanSchema.virtual('completedTime').get(function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  return this.tasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
});

// Ensure virtuals are included in JSON
studyPlanSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});
studyPlanSchema.set('toObject', { virtuals: true });

export default mongoose.model('StudyPlan', studyPlanSchema);