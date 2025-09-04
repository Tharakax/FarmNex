import mongoose from 'mongoose';

const SoilReadingSchema = new mongoose.Schema({
  deviceId: { 
    type: String, 
    required: true, 
    index: true,
    trim: true 
  },
  moisture: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  }, // percentage 0-100
  raw: { 
    type: Number,
    min: 0 
  }, // raw sensor reading
  fieldId: { 
    type: String,
    trim: true 
  }, // optional mapping to field/plot
  location: {
    latitude: Number,
    longitude: Number
  }, // optional GPS coordinates
  temperature: Number, // optional if sensor supports it
  batteryLevel: Number // optional battery monitoring
}, { 
  timestamps: { 
    createdAt: true, 
    updatedAt: false 
  } 
});

// Index for efficient queries
SoilReadingSchema.index({ deviceId: 1, createdAt: -1 });

// Static method to get latest reading for a device
SoilReadingSchema.statics.getLatest = function(deviceId) {
  return this.findOne({ deviceId }).sort({ createdAt: -1 });
};

// Static method to get reading history
SoilReadingSchema.statics.getHistory = function(deviceId, limit = 100) {
  return this.find({ deviceId })
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit, 10) || 100, 1000));
};

// Instance method to get moisture status
SoilReadingSchema.methods.getMoistureStatus = function() {
  if (this.moisture < 30) return { status: 'dry', color: 'red', message: 'Needs watering' };
  if (this.moisture > 70) return { status: 'wet', color: 'blue', message: 'Well watered' };
  return { status: 'optimal', color: 'green', message: 'Optimal moisture' };
};

export default mongoose.model('SoilReading', SoilReadingSchema);
