import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RecipeItem from "./RecipeItem.jsx";
import Navigation from "../navigation";

const API_URL = "http://localhost:3000/api/recipes";

const TYPE_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" }
];

const MEAL_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
  { value: "dessert", label: "Dessert" }
];

function RecipeList() {
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
      results = results.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(recipe.ingredients) && 
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }
    
    if (selectedTypes.length > 0) {
      results = results.filter(recipe => 
        selectedTypes.some(type => 
          recipe.type && recipe.type.toLowerCase() === type.toLowerCase()
        )
      );
    }
    
    if (selectedMeals.length > 0) {
      results = results.filter(recipe => {
        if (!recipe.meal) return false;
        
        let recipeMeals = [];
        
        if (Array.isArray(recipe.meal)) {
          recipeMeals = recipe.meal.map(m => m.toLowerCase().trim());
        } else if (typeof recipe.meal === 'string') {
          recipeMeals = recipe.meal.split(',').map(m => m.toLowerCase().trim());
        }
        
        return selectedMeals.some(meal => 
          recipeMeals.includes(meal.toLowerCase())
        );
      });
    }
    
    if (minRating > 0) {
      results = results.filter(recipe => 
        Number(recipe.rating) >= minRating
      );
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
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const toggleMeal = (meal) => {
    setSelectedMeals(prev => 
      prev.includes(meal) 
        ? prev.filter(m => m !== meal) 
        : [...prev, meal]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedMeals([]);
    setMinRating(0);
  };

  const hasActiveFilters = searchTerm || selectedTypes.length > 0 || selectedMeals.length > 0 || minRating > 0;

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 pt-30 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Recipe Catalog
            </span>
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                         bg-white text-gray-700 border border-gray-300 shadow-sm
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {selectedTypes.length + selectedMeals.length + (minRating > 0 ? 1 : 0) + (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 
                         shadow-sm w-full md:w-60"
            />

            <Link to="/recipes/add">
              <button
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                           bg-emerald-600 text-white shadow-sm shadow-emerald-200
                           hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
                           active:scale-[0.98] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="CurrentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Recipe
              </button>
            </Link>
          </div>
        </div>
        

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Type</h3>
                  <div className="space-y-2">
                    {TYPE_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(option.value)}
                          onChange={() => toggleType(option.value)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Meal</h3>
                  <div className="space-y-2">
                    {MEAL_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMeals.includes(option.value)}
                          onChange={() => toggleMeal(option.value)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700 flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-yellow-400">
                              <path d="M12 17.27l6.18 3.73-1.64-7.03 5-4.73-7.19-.62L12 2 9.65 8.62 2.5 9.24l5 4.73-1.64 7.03z"/>
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

          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600">
                    {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                    {hasActiveFilters && ' (filtered)'}
                  </p>
                </div>

                <div className={filteredRecipes.length > 0 ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : ""}>
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                      <RecipeItem
                        key={recipe._id}
                        recipe={recipe}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 极 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-4 text-gray-500">No recipes found. Try adjusting your filters.</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
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
    </div>
  );
}

const handleDownload = async () => {
  const res = await fetch("http://localhost:3000/api/recipes/download");
  const data = await res.blob();
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recipes.json";
  a.click();
};

<button 
  onClick={handleDownload}
  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
>
  ⬇️ Download Recipes
</button>

export default RecipeList;