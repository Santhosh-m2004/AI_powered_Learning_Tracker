import mongoose from 'mongoose';

const learningSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  timeSpent: {
    type: Number, // minutes
    required: [true, 'Time spent is required'],
    min: [1, 'Time spent must be at least 1 minute']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  productivityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
learningSessionSchema.index({ user: 1, date: -1 });
learningSessionSchema.index({ user: 1, subject: 1 });

export default mongoose.model('LearningSession', learningSessionSchema);