import mongoose from 'mongoose';

const farmSupplySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supply name is required'],
    trim: true,
    maxlength: [100, 'Supply name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Supply description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: [
        'seeds',
        'fertilizers',
        'pesticides',
        'tools',
        'irrigation',
        'animal-feed',
        'machinery',
        'equipment',
        'soil-amendments',
        'greenhouse-supplies'
      ],
      message: 'Please select correct category for farm supply'
    }
  },
  price: {
    type: Number,
    required: [true, 'Supply price is required'],
    min: [0, 'Price must be at least 0']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lb', 'g', 'piece', 'bag', 'bottle', 'liter', 'gallon', 'pack'],
    default: 'piece'
  },
  quantity: {
    type: Number,
    required: [true, 'Current quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minQuantity: {
    type: Number,
    required: [true, 'Minimum quantity threshold is required'],
    min: [0, 'Minimum quantity cannot be negative'],
    default: 5
  },
  maxQuantity: {
    type: Number,
    required: false,
    min: [0, 'Maximum quantity cannot be negative'],
    default: 1000
  },
  supplier: {
    name: {
      type: String,
      required: [true, 'Supplier name is required']
    },
    contact: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    }
  },
  expiryDate: {
    type: Date,
    required: false
  },
  batchNumber: {
    type: String,
    required: false
  },
  storage: {
    location: {
      type: String,
      required: false
    },
    temperature: {
      type: String,
      enum: ['room-temp', 'cool', 'cold', 'frozen'],
      default: 'room-temp'
    },
    instructions: {
      type: String,
      required: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  }
});

// Indexes for better performance
farmSupplySchema.index({ name: 'text', description: 'text' });
farmSupplySchema.index({ category: 1 });
farmSupplySchema.index({ price: 1 });
farmSupplySchema.index({ quantity: 1 });

const FarmSupply = mongoose.model('FarmSupply', farmSupplySchema);

export default FarmSupply;
