import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be at least 0']
  },
  displayprice: {
    type: Number,
    required: [false, 'Display Product price is optional'],
    min: [0, 'Display Price must be at least 0']
  },
    category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: [
        'vegetables',
        'fruits',
        'leafy-greens',
        'root-vegetables',
        'berries',
        'animal-products',
        'dairy-products',
        'meats',
        
        
        
      ],
      message: 'Please select correct category for product'
    }
  }
,
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    default: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lb','g', 'piece', 'bunch', 'pack'],
    default: 'kg'
  },
  images: [],
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [String],
  shelfLife: {
    type: Number,
    required: false,
    description: 'Expected shelf life in days'
  },
  storageInstructions: {
    type: String,
    required: false
  }
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;