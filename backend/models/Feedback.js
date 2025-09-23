import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Product', 'Service', 'Support', 'Website', 'General', 'Bug Report', 'Feature Request'],
    default: 'General'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
feedbackSchema.index({ 
  customerName: 'text', 
  email: 'text', 
  subject: 'text', 
  message: 'text',
  tags: 'text'
});

feedbackSchema.index({ category: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });

// Virtual for checking if feedback can be edited/deleted
feedbackSchema.virtual('canEdit').get(function() {
  const daysDifference = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  return daysDifference <= (process.env.EDIT_DELETE_DAYS_LIMIT || 7);
});

// Ensure virtual fields are serialised
feedbackSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Feedback', feedbackSchema);
