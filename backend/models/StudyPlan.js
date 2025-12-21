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
    subject: String,
    topic: String,
    estimatedTime: Number, // minutes
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
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
  }
}, {
  timestamps: true
});

// Auto-calculate progress
studyPlanSchema.pre('save', function(next) {
  if (this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.completed).length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  }
  next();
});

export default mongoose.model('StudyPlan', studyPlanSchema);