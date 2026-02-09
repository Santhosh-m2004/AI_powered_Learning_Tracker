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
    trim: true,
    default: ''
  },
  fileUrl: {
    type: String
  },
  filePublicId: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'text', 'other'],
    default: 'text'
  },
  aiSummary: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  subject: {
    type: String,
    trim: true,
    default: 'General'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number, // bytes
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ user: 1, subject: 1 });
noteSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted file size
noteSchema.virtual('formattedSize').get(function() {
  if (!this.size) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return `${(this.size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

// Ensure virtuals are included in JSON
noteSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});
noteSchema.set('toObject', { virtuals: true });

export default mongoose.model('Note', noteSchema);