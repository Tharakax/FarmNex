import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RecipeItem from "./RecipeItem.jsx";
import Navigation from "../navigation";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/recipes`;

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

function RecipeList({ showHeader = true, publicView = false }) {
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

  // Helper: convert inline SVG string to PNG data URL for jsPDF headers
  const svgToPngDataUrl = (svgString, width = 64, height = 64) => {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
          }
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG into image'));
        };
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  };

  // Helper: draw a simple left-to-right linear gradient bar
  const drawGradientBar = (doc, y, height, startRGB, endRGB, width) => {
    const steps = Math.max(1, Math.floor(width));
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * t);
      const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * t);
      const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * t);
      doc.setFillColor(r, g, b);
      doc.rect(i, y, 1, height, 'F');
    }
  };

  // 📥 Download all recipes as PDF (FarmNex theme)
  const handleDownloadAllPDF = async () => {
    if (!filteredRecipes || filteredRecipes.length === 0) {
      alert("No recipes available to download.");
      return;
    }

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const headerHeight = 34; // themed header bar (taller for two-line title)
    const footerHeight = 16; // themed footer bar
    const greenDark = [30, 126, 52]; // #1e7e34
    const green = [40, 167, 69]; // #28a745

    // Build a lightweight leaf SVG (embedded) and convert to PNG for consistent PDF rendering
    const leafSvg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path d="M8 40 C 8 20, 28 8, 48 8 C 48 28, 36 48, 16 48 Z" fill="#28a745"/>
        <path d="M16 48 C 22 38, 28 32, 40 20" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>`;
    let leafPng;
    try {
      leafPng = await svgToPngDataUrl(leafSvg, 96, 96);
    } catch (e) {
      leafPng = undefined; // proceed without icon if conversion fails
    }

    const generatedAt = new Date();
    const dateText = generatedAt.toLocaleString();
    const reportId = `FNX-${generatedAt.getFullYear()}-${String(generatedAt.getMonth()+1).padStart(2,'0')}${String(generatedAt.getDate()).padStart(2,'0')}-${String(generatedAt.getHours()).padStart(2,'0')}${String(generatedAt.getMinutes()).padStart(2,'0')}`;

    const rows = filteredRecipes.map((recipe, index) => {
      const meals = Array.isArray(recipe.meal)
        ? recipe.meal.join(', ')
        : recipe.meal || '—';
      return [
        index + 1,
        recipe.title || 'Untitled',
        recipe.type || 'N/A',
        meals,
        recipe.time || 'N/A',
      ];
    });

    autoTable(doc, {
      head: [["#", "Title", "Type", "Meals", "Time"]],
      body: rows,
      startY: headerHeight + 8,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: greenDark, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      bodyStyles: { valign: 'middle' },
      columnStyles: {
        0: { halign: 'right', cellWidth: 10 },
        1: { cellWidth: 78 },
        2: { cellWidth: 30 },
        3: { cellWidth: 54 },
        4: { cellWidth: 22 },
      },
      margin: { top: headerHeight + 6, bottom: footerHeight + 8, left: 10, right: 10 },
      didDrawPage: (data) => {
        // Header gradient bar with subtle overlay circle
        drawGradientBar(doc, 0, headerHeight, greenDark, green, pageWidth);
        // Decorative circle top-right
        doc.setFillColor(46, 204, 113); // lighter green
        doc.circle(pageWidth - 6, 6, 18, 'F');

        // Company and title + icon
        if (leafPng) {
          // draw leaf icon on the header (approx 9x9 mm)
          doc.addImage(leafPng, 'PNG', 8, 9, 9, 9);
        }
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('FARMNEX', 20, 14);
        doc.setFontSize(12);
        doc.text('Agricultural Analytics Report', 20, 22);

        // Right-aligned date and report id (two lines, like reference)
        doc.setFontSize(9.5);
        doc.text(`Generated: ${dateText}`, pageWidth - 10, 10, { align: 'right' });
        doc.text(`Report ID: ${reportId}`, pageWidth - 10, 16, { align: 'right' });

        // Footer bar
        const str = `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`;
        doc.setFillColor(...greenDark);
        doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8.5);
        doc.text('www.farmnex.com | support@farmnex.com', 10, pageHeight - 5);
        doc.text(str, pageWidth - 10, pageHeight - 5, { align: 'right' });
      }
    });

    doc.save('recipes.pdf');
  };

  return (
    <div>
      {showHeader && <Navigation />}
      <div className="max-w-7xl mx-auto px-4 pt-30 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Recipe Catalog
            </span>
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filters button (mobile) */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                         bg-white text-gray-700 border border-gray-300 shadow-sm
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Filters
              {hasActiveFilters && (
                <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {selectedTypes.length +
                    selectedMeals.length +
                    (minRating > 0 ? 1 : 0) +
                    (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Search bar */}
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 
                         shadow-sm w-full md:w-60"
            />

            {/* Download All (PDF) button (hidden in public view) */}
            {!publicView && filteredRecipes.length > 0 && (
              <button
                onClick={handleDownloadAllPDF}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                bg-orange-600 text-white shadow-sm shadow-orange-200
                hover:bg-orange-700 focus:ring-orange-500
                active:scale-[0.98] transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.586 6L12 2.414A2 2 0 0010.586 2H6zm4 5a.75.75 0 01.75.75V11h1.69a.75.75 0 01.53 1.28l-2.69 2.72a.75.75 0 01-1.06 0l-2.69-2.72a.75.75 0 01.53-1.28h1.69V7.75A.75.75 0 0110 7z"
                    clipRule="evenodd"
                  />
                </svg>
                Download All (PDF)
              </button>
            )}

            {/* Add Recipe button (hidden in public view) */}
            {!publicView && (
              <Link to="/recipes/add">
                <button
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                             bg-emerald-600 text-white shadow-sm shadow-emerald-200
                             hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
                             active:scale-[0.98] transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="CurrentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Recipe
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div
            className={`${
              isFilterOpen ? "block" : "hidden"
            } md:block w-full md:w-64 shrink-0`}
          >
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
                {/* Type filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Type
                  </h3>
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
                          className="rounded text-emerald-600 focus:ring-emerald-500"
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Meal
                  </h3>
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
                          className="rounded text-emerald-600 focus:ring-emerald-500"
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Minimum Rating
                  </h3>
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
                          className="text-emerald-600 focus:ring-emerald-500"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                      ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                      : ""
                  }
                >
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                      <RecipeItem
                        key={recipe._id}
                        recipe={recipe}
                        onDelete={publicView ? undefined : handleDelete}
                        readOnly={publicView}
                      />
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                      <p className="mt-4 text-gray-500">
                        No recipes found. Try adjusting your filters.
                      </p>
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

export default RecipeList;
