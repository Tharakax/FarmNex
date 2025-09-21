import mongoose from 'mongoose';

const { Schema } = mongoose;

const cropPlanSchema = new Schema({
  planName: {
    type: String,
    required: true,
    trim: true
  },
  cropType: {
    type: String,
    required: true,
    enum: ['Tomato', 'Rice', 'Carrot', 'Potato', 'Other']
  },
  variety: {
    type: String,
    required: true
  },
  plantingDate: {
    type: Date,
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  cycleDuration: {
    type: Number,
    default: function () {
      return Math.ceil((this.harvestDate - this.plantingDate) / (1000 * 60 * 60 * 24));
    }
  },
  areaSize: {
    value: { type: Number },
    unit: { type: String, enum: ['acres', 'hectares'], default: 'acres' }
  },
  soilType: {
    type: String,
    enum: ['Sandy', 'Loamy', 'Clay', 'Silt', 'Peaty']
  },
  irrigationMethod: {
    type: String,
    enum: ['Drip', 'Sprinkler', 'Manual', 'Flood', 'None']
  },
  fertilizers: [
    {
      day: { type: Number },
      fertilizer: { type: String },
      quantity: { type: Number },
      duration: { type: String }
    }
  ],
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Delayed'],
    default: 'Planned'
  },
  Litres_of_water: { type: String },
  Duration: { type: String },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update cycleDuration if harvestDate changes
cropPlanSchema.pre('save', function (next) {
  if (this.isModified('harvestDate') || this.isModified('plantingDate')) {
    this.cycleDuration = Math.ceil((this.harvestDate - this.plantingDate) / (1000 * 60 * 60 * 24));
  }
  next();
});

// 👇 This creates MongoDB collection "crops"
const Crop = mongoose.model('Crop', cropPlanSchema, 'crops');

export default Crop;
