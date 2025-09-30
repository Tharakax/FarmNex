import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const recipeSchema = new mongoose.Schema({
  recipeId: { type: Number, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  ingredients: { type: [String], default: [] },
  type: { type: String, enum: ['Vegetarian', 'Non-Vegetarian'], default: 'Vegetarian' },
  meal: { type: [String], default: [] },
  time: { type: String, default: '' }, // e.g., "30 mins"
  rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

recipeSchema.pre('save', async function(next) {
  if (this.isNew && (this.recipeId == null)) {
    const counter = await Counter.findByIdAndUpdate(
      'recipeId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.recipeId = counter.seq;
  }
  next();
});

recipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
export default Recipe;
