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
  }, 
  raw: { 
    type: Number,
    min: 0 
  }, 
  fieldId: { 
    type: String,
    trim: true 
  }, 
  location: {
    latitude: Number,
    longitude: Number
  }, 
  temperature: Number, 
  batteryLevel: Number 
}, { 
  timestamps: { 
    createdAt: true, 
    updatedAt: false 
  } 
});


SoilReadingSchema.index({ deviceId: 1, createdAt: -1 });

SoilReadingSchema.statics.getLatest = function(deviceId) {
  return this.findOne({ deviceId }).sort({ createdAt: -1 });
};

SoilReadingSchema.statics.getHistory = function(deviceId, limit = 100) {
  return this.find({ deviceId })
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit, 10) || 100, 1000));
};

SoilReadingSchema.methods.getMoistureStatus = function() {
  if (this.moisture < 30) return { status: 'dry', color: 'red', message: 'Needs watering' };
  if (this.moisture > 70) return { status: 'wet', color: 'blue', message: 'Well watered' };
  return { status: 'optimal', color: 'green', message: 'Optimal moisture' };
};

export default mongoose.model('SoilReading', SoilReadingSchema);
