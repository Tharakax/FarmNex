import express from "express";
const router = express.Router();

import {
  getAllRecipes,
  addRecipes,
  getById,
  updateRecipe,
  deleteRecipe,
} from "../controllers/RecipeControllers.js";

router.get("/", getAllRecipes);
router.post("/", addRecipes);
router.get("/:RecipeId", getById);
router.put("/:RecipeId", updateRecipe);
router.delete("/:RecipeId", deleteRecipe);

export default router;
