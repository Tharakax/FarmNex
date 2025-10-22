import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  shipping: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash_on_delivery'],
    required: false,
    default: 'credit_card',
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contactName: {
  type: String,
  required: false,
},
  contactEmail: {
    type: String,
    required: false,
  },
  contactPhone: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  paymentcompleted: {
    type: Boolean,
    default: false,
  },
  shippinginfo: {
    type: Boolean,
    default: false,
  },

  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: {
    type: Date,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },

  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed', 'partial', 'failed'],
    default: 'none',
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundMethod: {
    type: String,
  },
  refundTxnId: {
    type: String,
  },
  refundAt: {
    type: Date,
  },
  refundNote: {
    type: String,
  },

  paymentDetails: {
    paymentIntentId: String,
    stripePaymentIntentId: String,
    chargeId: String,
    cardBrand: String,
    last4: String,
    source: String, 
    error: String,
    // Cash on delivery specific fields
    codFee: Number,
    totalWithCod: Number,
    status: String
  },
}, {
  timestamps: true, 
});
const Order = mongoose.model('Order', orderSchema);

export default Order;  