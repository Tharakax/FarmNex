import mongoose from "mongoose";

const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  recipeId: {
    type: String,
    unique: true,
  },

  title: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true
  },
  
  
  description: {
    type: String,
    required: true,
  },

  ingredients: {
    type: [String],
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  meal: {
    type: [String],
    required: true,
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },

});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
