import mongoose from 'mongoose';
import validator from 'validator';
const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment method must belong to a user']
  },
  paymentMethodId: {
    type: String,
    required: [true, 'Payment processor ID is required'],
    unique: false
  },
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners', 'unionpay', 'unknown'],
    required: [true, 'Card brand is required']
  },
  last4: {
    type: String,
    required: [true, 'Last 4 digits are required'],
    validate: {
      validator: function(val) {
        return /^\d{4}$/.test(val);
      },
      message: 'Last 4 must be exactly 4 digits'
    }
  },
  expMonth: {
    type: Number,
    required: [true, 'Expiration month is required'],
    min: [1, 'Expiration month must be between 1-12'],
    max: [12, 'Expiration month must be between 1-12']
  },
  expYear: {
    type: Number,
    required: [true, 'Expiration year is required'],
    validate: {
      validator: function(val) {
        const currentYear = new Date().getFullYear();
        return val >= currentYear && val <= currentYear + 20;
      },
      message: 'Expiration year must be current or future year'
    }
  },
  billingDetails: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot be longer than 100 characters']
    },
    email: {
      type: String,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  fingerprint: {
    type: String,
    select: false // Don't include in query results by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ isDefault: 1 });
PaymentSchema.index({ paymentMethodId: 1 }, { unique: true });

// Update the updatedAt field before saving
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get user's default payment method
PaymentSchema.statics.getDefault = async function(userId) {
  return this.findOne({ user: userId, isDefault: true });
};

// Static method to get all payment methods for a user
PaymentSchema.statics.getForUser = async function(userId) {
  return this.find({ user: userId }).sort('-isDefault -createdAt');
};

// Virtual for formatted expiration date
PaymentSchema.virtual('expDate').get(function() {
  return `${this.expMonth.toString().padStart(2, '0')}/${this.expYear.toString().slice(-2)}`;
});

// Virtual for masked card number
PaymentSchema.virtual('maskedNumber').get(function() {
  return `•••• •••• •••• ${this.last4}`;
});

// Validate that a user only has one default payment method
PaymentSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;