import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RecipeItem from "./RecipeItem.jsx";
import { Plus, Download, Filter, X } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:3000/api/recipes";

const TYPE_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
];

const MEAL_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
  { value: "dessert", label: "Dessert" },
];

function FarmerRecipeManagement() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL);
      setRecipes(res.data.recipes || []);
      setFilteredRecipes(res.data.recipes || []);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    let results = recipes;

    if (searchTerm) {
      results = results.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(recipe.ingredients) &&
            recipe.ingredients.some((ingredient) =>
              ingredient.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (selectedTypes.length > 0) {
      results = results.filter((recipe) =>
        selectedTypes.some(
          (type) =>
            recipe.type && recipe.type.toLowerCase() === type.toLowerCase()
        )
      );
    }

    if (selectedMeals.length > 0) {
      results = results.filter((recipe) => {
        if (!recipe.meal) return false;

        let recipeMeals = [];

        if (Array.isArray(recipe.meal)) {
          recipeMeals = recipe.meal.map((m) => m.toLowerCase().trim());
        } else if (typeof recipe.meal === "string") {
          recipeMeals = recipe.meal
            .split(",")
            .map((m) => m.toLowerCase().trim());
        }

        return selectedMeals.some((meal) =>
          recipeMeals.includes(meal.toLowerCase())
        );
      });
    }

    if (minRating > 0) {
      results = results.filter((recipe) => Number(recipe.rating) >= minRating);
    }

    setFilteredRecipes(results);
  }, [recipes, searchTerm, selectedTypes, selectedMeals, minRating]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRecipes();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleMeal = (meal) => {
    setSelectedMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedMeals([]);
    setMinRating(0);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedTypes.length > 0 ||
    selectedMeals.length > 0 ||
    minRating > 0;

  // Download all recipes as PDF
  const handleDownloadAllPDF = () => {
    if (!filteredRecipes || filteredRecipes.length === 0) {
      alert("No recipes available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Farm Recipe Catalog", 14, 20);

    const rows = filteredRecipes.map((recipe, index) => [
      index + 1,
      recipe.title || "Untitled",
      recipe.type || "N/A",
      recipe.description || "N/A",
      Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(", ")
        : recipe.ingredients || "N/A",
      Array.isArray(recipe.meal)
        ? recipe.meal.join(", ")
        : recipe.meal || "N/A",
      recipe.rating || 0,
    ]);

    autoTable(doc, {
      head: [
        ["#", "Title", "Type", "Description", "Ingredients", "Meals", "Rating"],
      ],
      body: rows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129] }, // emerald green header
    });

    doc.save("farm_recipes.pdf");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Recipe Management
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Add Recipe button */}
          <Link
            to="/recipes/add"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                       bg-green-600 text-white shadow-sm
                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                       transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Recipe
          </Link>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadAllPDF}
            disabled={filteredRecipes.length === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                       bg-blue-600 text-white shadow-sm
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>

          {/* Filters button (mobile) */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                       bg-white text-gray-700 border border-gray-300 shadow-sm
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedTypes.length +
                  selectedMeals.length +
                  (minRating > 0 ? 1 : 0) +
                  (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recipes by title, description, or ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className={`lg:w-64 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden p-1 rounded hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Type filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Type
                </h4>
                <div className="space-y-2">
                  {TYPE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(option.value)}
                        onChange={() => toggleType(option.value)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meal filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Meal
                </h4>
                <div className="space-y-2">
                  {MEAL_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMeals.includes(option.value)}
                        onChange={() => toggleMeal(option.value)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Minimum Rating
                </h4>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() =>
                          setMinRating(minRating === rating ? 0 : rating)
                        }
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center">
                        {Array.from({ length: rating }).map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-yellow-400"
                          >
                            <path d="M12 17.27l6.18 3.73-1.64-7.03 5-4.73-7.19-.62L12 2 9.65 8.62 2.5 9.24l5 4.73-1.64 7.03z" />
                          </svg>
                        ))}
                        <span className="ml-1">& up</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {filteredRecipes.length} recipe
                  {filteredRecipes.length !== 1 ? "s" : ""} found
                  {hasActiveFilters && " (filtered)"}
                </p>
              </div>

              <div
                className={
                  filteredRecipes.length > 0
                    ? "grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                    : ""
                }
              >
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <RecipeItem
                      key={recipe._id}
                      recipe={recipe}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-10 text-center">
                    <p className="mt-4 text-gray-500">
                      No recipes found. Try adjusting your filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmerRecipeManagement;