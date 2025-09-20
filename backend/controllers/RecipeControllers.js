import Recipe from "../models/RecipeModel.js";

// Display - Get
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found" });
    }

    return res.status(200).json({ recipes });
  } catch (err) {
    console.error("getAllRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Insert - Post
const addRecipes = async (req, res) => {
  try {
    const {
      recipeId,
      image,
      title,
      description,
      ingredients,
      type,
      meal,
      rating,
    } = req.body;

    if (!recipeId || !title || !description || !ingredients || !type || !meal) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ingredientsArr = Array.isArray(ingredients)
      ? ingredients
      : String(ingredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const recipe = await Recipe.create({
      recipeId,
      image: image || "https://via.placeholder.com/600x400?text=Recipe",
      title,
      description,
      ingredients: ingredientsArr,
      type,
      meal: Array.isArray(meal)
        ? meal
        : String(meal)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      rating: rating || 0,
    });

    return res.status(201).json({ recipe });
  } catch (err) {
    console.error("addRecipes error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "recipeId must be unique" });
    }

    return res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Get by id
const getById = async (req, res) => {
  const id = req.params.RecipeId;

  try {
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    return res.status(200).json({ recipe });
  } catch (err) {
    console.error("getById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update - Put
const updateRecipe = async (req, res) => {
  const id = req.params.RecipeId;
  const {
    recipeId,
    image,
    title,
    description,
    ingredients,
    type,
    meal,
    rating,
  } = req.body;

  try {
    // Handle ingredients conversion
    const ingredientsArr = Array.isArray(ingredients)
      ? ingredients
      : String(ingredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    // Handle meal conversion
    const mealArr = Array.isArray(meal)
      ? meal
      : String(meal)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      {
        recipeId,
        image: image || "https://via.placeholder.com/600x400?text=Recipe",
        title,
        description,
        ingredients: ingredientsArr,
        type,
        meal: mealArr,
        rating: rating || 0,
      },
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    return res.status(200).json({ recipe });
  } catch (err) {
    console.error("updateRecipe error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "recipeId must be unique" });
    }

    return res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Delete - Delete
const deleteRecipe = async (req, res) => {
  const id = req.params.RecipeId;

  try {
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    return res
      .status(200)
      .json({ message: "Recipe deleted successfully", recipe });
  } catch (err) {
    console.error("deleteRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export { getAllRecipes, addRecipes, getById, updateRecipe, deleteRecipe };
