import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RecipeItem from "./RecipeItem.jsx";
import Navigation from "../../components/navigation";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  drawFarmNexPdfHeader,
  addFarmNexFooter,
  loadImageAsBase64,
  renderBarChartToDataUrl,
  renderDonutChartToDataUrl,
} from "../../utils/exportUtils.js";

const API_URL = `${
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
}/api/recipes`;

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showTimeRangePopup, setShowTimeRangePopup] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

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

    setFilteredRecipes(results);
  }, [recipes, searchTerm, selectedTypes, selectedMeals]);

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
  };

  // Modal handlers
  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    setIsModalOpen(false);
  };

  const openTimeRangePopup = () => {
    setShowTimeRangePopup(true);
    setDateError("");
  };

  const closeTimeRangePopup = () => {
    setShowTimeRangePopup(false);
    setStartDate("");
    setEndDate("");
    setDateError("");
  };


 

  

const validateDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let error = "";

  if (!startDate || !endDate) {
    error = "Please select both start and end dates.";
  } else {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const startTime = start.getTime();
    const endTime = end.getTime();
    const todayTime = today.getTime();

    if (startTime > todayTime) {
      error = `Start date (${start.toLocaleDateString()}) cannot be in the future.`;
    } else if (endTime > todayTime) {
      error = `End date (${end.toLocaleDateString()}) cannot be in the future.`;
    } else if (startTime === endTime) {
      error = "Start and end dates cannot be the same day.";
    } else if (startTime > endTime) {
      error = "Start date cannot be after end date.";
    } else {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (startTime < oneYearAgo.getTime()) {
        error = "Start date cannot be more than 1 year ago.";
      }
    }
  }

  setDateError(error);
  return error === "";
};






  // Filter recipes by date range
  const filterRecipesByDateRange = (recipes, start, end) => {
    if (!start && !end) return recipes;

    const startTime = start ? new Date(start).getTime() : 0;
    const endTime = end ? new Date(end).setHours(23, 59, 59, 999) : Date.now();

    return recipes.filter(recipe => {
      if (!recipe.createdAt) return true; 
      
      const recipeDate = new Date(recipe.createdAt).getTime();
      return recipeDate >= startTime && recipeDate <= endTime;
    });
  };

  const hasActiveFilters =
    searchTerm || selectedTypes.length > 0 || selectedMeals.length > 0;


  const svgToPngDataUrl = (svgString, width = 64, height = 64) => {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/png");
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
          }
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load SVG into image"));
        };
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  };

  const drawGradientBar = (doc, y, height, startRGB, endRGB, width) => {
    const steps = Math.max(1, Math.floor(width));
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * t);
      const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * t);
      const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * t);
      doc.setFillColor(r, g, b);
      doc.rect(i, y, 1, height, "F");
    }
  };



  // Download recipes PDF
  const handleDownloadPDFWithTimeRange = async () => {
    if (!filteredRecipes || filteredRecipes.length === 0) {
      alert("No recipes available to download.");
      return;
    }

    // Validate date range
    if (!validateDateRange()) {
      return;
    }

    // Apply date range filter
    const timeFilteredRecipes = filterRecipesByDateRange(
      filteredRecipes, 
      startDate, 
      endDate
    );

    if (timeFilteredRecipes.length === 0) {
      alert("No recipes found in the selected time range.");
      return;
    }

    // Generate filename with date range
    let filename = "recipes";
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('en-CA');
      const end = new Date(endDate).toLocaleDateString('en-CA');
      filename = `recipes_${start}_to_${end}`;
    } else if (startDate) {
      filename = `recipes_from_${new Date(startDate).toLocaleDateString('en-CA')}`;
    } else if (endDate) {
      filename = `recipes_until_${new Date(endDate).toLocaleDateString('en-CA')}`;
    }

    await generatePDF(timeFilteredRecipes, filename);
    closeTimeRangePopup();
  };

  // Generate PDF function
  const generatePDF = async (recipesToDownload, filename) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    //header
    let subtitle = `Total Recipes: ${recipesToDownload.length}`;
    if (startDate || endDate) {
      const rangeText = [];
      if (startDate) rangeText.push(`From: ${new Date(startDate).toLocaleDateString()}`);
      if (endDate) rangeText.push(`To: ${new Date(endDate).toLocaleDateString()}`);
      subtitle += ` (${rangeText.join(' - ')})`;
    }

    const headerBottomY = drawFarmNexPdfHeader(
      doc,
      "Recipe Catalog",
      pageWidth,
      {
        align: "center",
        titleFontSize: 26,
        tileSize: 18,
        subtitle: subtitle,
        titleColor: [34, 197, 94],
      }
    );

    const metaY = headerBottomY + 8;
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    const now = new Date();
    doc.text(
      `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      15,
      metaY
    );
    doc.text(
      `Total Records: ${recipesToDownload.length}`,
      pageWidth - 15,
      metaY,
      { align: "right" }
    );

    //rows
    const rows = recipesToDownload.map((recipe, index) => {
      const meals = Array.isArray(recipe.meal)
        ? recipe.meal.join(", ")
        : recipe.meal || "—";
      return [
        index + 1,
        recipe.title || "Untitled",
        recipe.type || "N/A",
        meals,
        recipe.time || "N/A",
      ];
    });

    autoTable(doc, {
      head: [["#", "Title", "Type", "Meals", "Time"]],
      body: rows,
      startY: headerBottomY + 18,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      bodyStyles: { valign: "middle" },
      columnStyles: {
        0: { halign: "right", cellWidth: 10 },
        1: { cellWidth: 78 },
        2: { cellWidth: 30 },
        3: { cellWidth: 54 },
        4: { cellWidth: 22 },
      },
      margin: { left: 10, right: 10, top: headerBottomY + 16, bottom: 30 },
    });

    try {
      const typeMap = new Map();
      const mealMap = new Map();
      recipesToDownload.forEach((r) => {
        const type = (r.type || "Unknown").toString();
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
        const meals = Array.isArray(r.meal)
          ? r.meal
          : typeof r.meal === "string"
          ? r.meal.split(",")
          : [];
        meals
          .map((m) => (m || "").toString().trim())
          .filter(Boolean)
          .forEach((m) => mealMap.set(m, (mealMap.get(m) || 0) + 1));
      });
      const typeSeries = Array.from(typeMap.entries()).map(([name, value]) => ({
        label: name,
        value,
      }));
      const mealSeries = Array.from(mealMap.entries()).map(([name, value]) => ({
        label: name,
        value,
      }));

      
      doc.addPage();
      const hbSummary = drawFarmNexPdfHeader(
        doc,
        "Recipe Insights Summary",
        pageWidth,
        {
          align: "center",
          titleFontSize: 24,
          tileSize: 18,
          titleColor: [34, 197, 94],
        }
      );

      const margin = 12;
      const topY = hbSummary + 8;
      const availW = pageWidth - margin * 2;
      const chartAreaHeight = (pageHeight - topY - 20) / 2;

      // Bar chart
      const barUrl = await renderBarChartToDataUrl(typeSeries, 1600, 600, {
        title: "Recipes by Type",
        yLabel: "Count",
        scale: 3,
        titleFontSize: 30,
        tickFontSize: 18,
        labelFontSize: 20,
        valueFontSize: 20,
        maxBarWidth: 240,
      });
      if (barUrl) {
        doc.addImage(barUrl, "PNG", margin, topY, availW, chartAreaHeight - 10);
      }

      // Donut chart
      const pieUrl = await renderDonutChartToDataUrl(mealSeries, 900, {
        title: "Recipes by Meal",
        scale: 3,
        titleFontSize: 30,
        percentFontSize: 20,
        legendFontSize: 14,
        centerFontSize: 18,
      });
      if (pieUrl) {
        const pieSize_mm = Math.min(availW - 20, chartAreaHeight - 15);
        const x = margin + (availW - pieSize_mm) / 2;
        const y = topY + chartAreaHeight + 5;
        doc.addImage(pieUrl, "PNG", x, y, pieSize_mm, pieSize_mm);
      }
    } catch (e) {
      console.warn("Recipe charts failed:", e);
    }

    addFarmNexFooter(doc);

    doc.save(`${filename}.pdf`);
  };

  return (
    <div>
      {showHeader && <Navigation />}
      <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8 py-10">
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
              Filters
              {hasActiveFilters && (
                <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {selectedTypes.length +
                    selectedMeals.length +
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

           
            {!publicView && filteredRecipes.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Time Range PDF Download */}
                <button
                  onClick={openTimeRangePopup}
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>
            )}

            
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
                        onViewDetails={openModal}
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

      {/* Recipe Modal */}
      {isModalOpen && selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred background */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal body */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Recipe image */}
              {selectedRecipe.image && (
                <div className="relative h-64 md:h-80">
                  <img
                    src={
                      selectedRecipe.image.startsWith("http")
                        ? selectedRecipe.image
                        : `${
                            import.meta.env.VITE_BACKEND_URL ||
                            "http://localhost:3000"
                          }${selectedRecipe.image.startsWith("/") ? "" : "/"}${
                            selectedRecipe.image
                          }`
                    }
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/800x400?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Recipe header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                      {selectedRecipe.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        {selectedRecipe.type || "Type"}
                      </span>
                    </div>
                  </div>

                  <p className="text-lg text-gray-600 leading-relaxed">
                    {selectedRecipe.description}
                  </p>
                </div>

                {/* Recipe details grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* Cooking time and Meal type in same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cooking time */}
                      {selectedRecipe.time && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Cooking Time
                          </h3>
                          <p className="text-gray-700">{selectedRecipe.time}</p>
                        </div>
                      )}
                      {/* Meal types */}
                      {selectedRecipe.meal && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m0 0h9.5"
                              />
                            </svg>
                            Meal Type
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(selectedRecipe.meal)
                              ? selectedRecipe.meal
                              : selectedRecipe.meal
                                  .split(",")
                                  .map((m) => m.trim())
                            ).map((meal, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                              >
                                {meal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right column */}
                  <div>
                    {/* Ingredients */}
                    {selectedRecipe.ingredients && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Ingredients
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {Array.isArray(selectedRecipe.ingredients) ? (
                            <ul className="space-y-2">
                              {selectedRecipe.ingredients.map(
                                (ingredient, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2 text-gray-700"
                                  >
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>{ingredient}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-gray-700 whitespace-pre-line">
                              {selectedRecipe.ingredients}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Time Range Popup */}
      {showTimeRangePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred background */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={closeTimeRangePopup}
          ></div>

          {/* Popup content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Time Range
              </h3>
              <button
                onClick={closeTimeRangePopup}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    validateDateRange();
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    validateDateRange();
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {dateError && (
                <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                  {dateError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeTimeRangePopup}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold
                           bg-gray-100 text-gray-700 border border-gray-300
                           hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadPDFWithTimeRange}
                  disabled={!startDate && !endDate}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold
                           bg-emerald-600 text-white shadow-sm
                           hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
                           disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Download PDF
                </button>
              </div>

              {(startDate || endDate) && (
                <p className="text-xs text-gray-500 text-center">
                  {startDate && endDate 
                    ? `Downloading recipes from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                    : startDate 
                    ? `Downloading recipes from ${new Date(startDate).toLocaleDateString()} onwards`
                    : `Downloading recipes until ${new Date(endDate).toLocaleDateString()}`
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeList;