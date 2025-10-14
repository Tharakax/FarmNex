import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RecipeItem from "./RecipeItem.jsx";
import Navigation from '../../components/navigation';

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawFarmNexPdfHeader, addFarmNexFooter, loadImageAsBase64, renderBarChartToDataUrl, renderDonutChartToDataUrl } from "../../utils/exportUtils.js";

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

  const hasActiveFilters =
    searchTerm ||
    selectedTypes.length > 0 ||
    selectedMeals.length > 0;

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

  // 📥 Download all recipes as PDF (aligned with other reports)
  const handleDownloadAllPDF = async () => {
    if (!filteredRecipes || filteredRecipes.length === 0) {
      alert("No recipes available to download.");
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Branded header (same style as other reports) with green title
    const headerBottomY = drawFarmNexPdfHeader(doc, 'Recipe Catalog', pageWidth, {
      align: 'center',
      titleFontSize: 26,
      tileSize: 18,
      subtitle: `Total Recipes: ${filteredRecipes.length}`,
      titleColor: [34, 197, 94]
    });

    // Meta line below header
    const metaY = headerBottomY + 8;
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    const now = new Date();
    doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 15, metaY);
    doc.text(`Total Records: ${filteredRecipes.length}`, pageWidth - 15, metaY, { align: 'right' });

    // Prepare rows
    const rows = filteredRecipes.map((recipe, index) => {
      const meals = Array.isArray(recipe.meal) ? recipe.meal.join(', ') : (recipe.meal || '—');
      return [
        index + 1,
        recipe.title || 'Untitled',
        recipe.type || 'N/A',
        meals,
        recipe.time || 'N/A',
      ];
    });

    // Table styling consistent with other reports
    autoTable(doc, {
      head: [["#", "Title", "Type", "Meals", "Time"]],
      body: rows,
      startY: headerBottomY + 18,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      bodyStyles: { valign: 'middle' },
      columnStyles: {
        0: { halign: 'right', cellWidth: 10 },
        1: { cellWidth: 78 },
        2: { cellWidth: 30 },
        3: { cellWidth: 54 },
        4: { cellWidth: 22 },
      },
      margin: { left: 10, right: 10, top: headerBottomY + 16, bottom: 30 }
    });

    // Charts pages (larger): full-width bar on its own page, large donut on a second page
    try {
      const typeMap = new Map();
      const mealMap = new Map();
      filteredRecipes.forEach(r => {
        const type = (r.type || 'Unknown').toString();
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
        const meals = Array.isArray(r.meal) ? r.meal : (typeof r.meal === 'string' ? r.meal.split(',') : []);
        meals.map(m => (m || '').toString().trim()).filter(Boolean).forEach(m => mealMap.set(m, (mealMap.get(m) || 0) + 1));
      });
      const typeSeries = Array.from(typeMap.entries()).map(([name, value]) => ({ label: name, value }));
      const mealSeries = Array.from(mealMap.entries()).map(([name, value]) => ({ label: name, value }));

      // Page for bar chart (wide)
      doc.addPage();
      const hbBar = drawFarmNexPdfHeader(doc, 'Recipe Insights — Types', pageWidth, { align: 'center', titleFontSize: 24, tileSize: 18, titleColor: [34,197,94] });
      const margin = 12; const topBarY = hbBar + 8; const availW = pageWidth - margin * 2; const barH_mm = 110; // big bar area
      const barUrl = await renderBarChartToDataUrl(typeSeries, 1600, 600, { title: 'Recipes by Type', yLabel: 'Count', scale: 3, titleFontSize: 30, tickFontSize: 18, labelFontSize: 20, valueFontSize: 20, maxBarWidth: 240 });
      if (barUrl) {
        doc.addImage(barUrl, 'PNG', margin, topBarY, availW, barH_mm);
      }

      // Page for donut chart (large)
      doc.addPage();
      const hbPie = drawFarmNexPdfHeader(doc, 'Recipe Insights — Meals', pageWidth, { align: 'center', titleFontSize: 24, tileSize: 18, titleColor: [34,197,94] });
      const topPieY = hbPie + 16; const pieSize_mm = Math.min(pageWidth - 50, 150);
      const pieUrl = await renderDonutChartToDataUrl(mealSeries, 900, { title: 'Recipes by Meal', scale: 3, titleFontSize: 30, percentFontSize: 20, legendFontSize: 14, centerFontSize: 18 });
      if (pieUrl) {
        const x = (pageWidth - pieSize_mm) / 2;
        doc.addImage(pieUrl, 'PNG', x, topPieY, pieSize_mm, pieSize_mm);
      }
    } catch (e) { console.warn('Recipe charts failed:', e); }

    // Gallery page with images and descriptions
    try {
      doc.addPage();
      const hb3 = drawFarmNexPdfHeader(doc, 'Recipe Gallery', pageWidth, { align: 'center', titleFontSize: 24, tileSize: 18, titleColor: [34,197,94] });
      let x = 15; let y = hb3 + 8; const gap = 8; const cardW = (pageWidth - 15*2 - gap)/2; const imgH = 40; const cardH = 58;
      const addCard = async (rec) => {
        // Image with proper aspect ratio handling
        let imgUrl = rec.image || rec.imageUrl || (Array.isArray(rec.images) ? rec.images[0] : null);
        let addedImg = false;
        
        if (imgUrl) {
          try {
            // Load image and get its natural dimensions
            const base64 = await loadImageAsBase64(imgUrl, 400, 300); // Reasonable max size
            
            // Create a temporary image to get its dimensions after processing
            const tempImg = new Image();
            await new Promise((resolve) => {
              tempImg.onload = resolve;
              tempImg.src = base64;
            });
            
            // Calculate aspect ratio preserving dimensions that fit in the card area
            const imgAspect = tempImg.width / tempImg.height;
            const cardAspect = cardW / imgH;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imgAspect > cardAspect) {
              // Image is wider - fit to width
              drawWidth = cardW;
              drawHeight = cardW / imgAspect;
              drawX = x;
              drawY = y + (imgH - drawHeight) / 2; // Center vertically
            } else {
              // Image is taller - fit to height
              drawHeight = imgH;
              drawWidth = imgH * imgAspect;
              drawX = x + (cardW - drawWidth) / 2; // Center horizontally
              drawY = y;
            }
            
            // Draw background rectangle (for centering effect)
            doc.setFillColor(248, 248, 248);
            doc.rect(x, y, cardW, imgH, 'F');
            
            // Draw the properly sized image
            doc.addImage(base64, 'JPEG', drawX, drawY, drawWidth, drawHeight);
            addedImg = true;
            
          } catch (error) {
            console.warn('Failed to load recipe image:', imgUrl, error);
          }
        }
        
        if (!addedImg) { 
          doc.setFillColor(240, 240, 240); 
          doc.rect(x, y, cardW, imgH, 'F'); 
          doc.setTextColor(150); 
          doc.setFontSize(8); 
          doc.text('No Image', x + cardW/2, y + imgH/2, { align: 'center' }); 
        }
        // Title
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(34,197,94); doc.text(rec.title || 'Untitled', x + 2, y + imgH + 6);
        // Description
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(31,41,55);
        const desc = (rec.description || '').toString();
        const lines = doc.splitTextToSize(desc, cardW - 4).slice(0,3);
        doc.text(lines, x + 2, y + imgH + 12);
        // Border
        doc.setDrawColor(209,213,219); doc.rect(x, y, cardW, cardH, 'S');
        // Next position
        x += cardW + gap;
        if (x + cardW > pageWidth - 15) { x = 15; y += cardH + gap; if (y + cardH > pageHeight - 20) { doc.addPage(); const hb = drawFarmNexPdfHeader(doc, 'Recipe Gallery (cont.)', pageWidth, { align: 'center', titleFontSize: 24, tileSize: 18, titleColor: [34,197,94] }); y = hb + 8; } }
      };
      for (const r of filteredRecipes) { // sequential to keep layout stable
        await addCard(r);
      }
    } catch (e) { console.warn('Recipe gallery failed:', e); }

    // Branded footer with page numbers and contact
    addFarmNexFooter(doc);

    doc.save('recipes.pdf');
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
