import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
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
  content: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String
  },
  filePublicId: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'text', 'other']
  },
  aiSummary: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  subject: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number // bytes
  }
}, {
  timestamps: true
});

// Index for search functionality
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ user: 1, subject: 1 });

export default mongoose.model('Note', noteSchema);