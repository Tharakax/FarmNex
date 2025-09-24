import Recipe from '../models/recipe.js';

export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json({ success: true, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipes', error: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipe', error: error.message });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const payload = req.body || {};
    const recipe = await Recipe.create({
      title: String(payload.title),
      description: String(payload.description),
      image: String(payload.image || ''),
      ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : String(payload.ingredients || '').split(',').map(s=>s.trim()).filter(Boolean),
      type: payload.type || 'Vegetarian',
      meal: Array.isArray(payload.meal) ? payload.meal : String(payload.meal || '').split(',').map(s=>s.trim()).filter(Boolean),
      time: String(payload.time || ''),
      rating: payload.rating != null ? Number(payload.rating) : 0,
    });
    res.status(201).json({ success: true, recipe });
  } catch (error) {
    const code = error.code === 11000 ? 400 : 500;
    res.status(code).json({ success: false, message: error.code === 11000 ? 'Duplicate recipeId' : 'Failed to create recipe', error: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const payload = req.body || {};
    const update = {
      title: payload.title,
      description: payload.description,
      image: payload.image,
      type: payload.type,
      time: payload.time,
    };
    if (payload.ingredients !== undefined) {
      update.ingredients = Array.isArray(payload.ingredients) ? payload.ingredients : String(payload.ingredients).split(',').map(s=>s.trim()).filter(Boolean);
    }
    if (payload.meal !== undefined) {
      update.meal = Array.isArray(payload.meal) ? payload.meal : String(payload.meal).split(',').map(s=>s.trim()).filter(Boolean);
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update recipe', error: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete recipe', error: error.message });
  }
};