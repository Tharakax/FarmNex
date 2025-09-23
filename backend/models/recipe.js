import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeId: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  ingredients: { type: [String], default: [] },
  type: { type: String, enum: ['Vegetarian', 'Non-Vegetarian'], default: 'Vegetarian' },
  meal: { type: [String], default: [] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

recipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;