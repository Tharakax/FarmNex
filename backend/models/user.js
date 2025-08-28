import mongoose from 'mongoose';
import validator from 'validator';


const userSchema = new mongoose.Schema({

    role: {
    type: String,
    
    required: true,
    default: 'customer'
  },
  firstName: {
    type: String,
    required: [true, 'Please provide your first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
    
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return validator.isMobilePhone(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    line1: {
      type: String,
      trim: true
    },
    line2: {
      type: String,
      trim: true
    },
    province: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  farmDetails: { // Only relevant for farmers
    farmName: {
      type: String,
      trim: true
    },
    farmDescription: {
      type: String,
      trim: true
    },
    farmLocation: {
      type: String,
      trim: true
    },
    certifications: [String]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  profilePicture: {
    type: String,
    default: 'default-profile.jpg'
  }
});

const User = new mongoose.model('User', userSchema);
export default User;

