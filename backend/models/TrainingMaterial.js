import mongoose from 'mongoose';

const trainingMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['Video', 'Guide', 'Article', 'PDF', 'FAQ'],
    default: 'Article'
  },
  uploadLink: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: false
  },
  fileSize: {
    type: Number,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    required: true,
    enum: ['Crop Management', 'Livestock', 'Equipment', 'Finance', 'Marketing', 'General'],
    default: 'General'
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

trainingMaterialSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('TrainingMaterial', trainingMaterialSchema);
