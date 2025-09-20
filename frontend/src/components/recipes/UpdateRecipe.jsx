// UpdateRecipe.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../navigation";
import MediaUpload from "../../utils/medialUpload";
import StarRating from "./StarRating";

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert"];
const TYPE_OPTIONS = ["Vegetarian", "Non-Vegetarian"];

export default function UpdateRecipe() {
  const nav = useNavigate();
  const { id } = useParams();

  // form state
  const [inputs, setInputs] = useState({
    recipeId: "",
    title: "",
    description: "",
    ingredients: "", // keep as CSV string in the UI
    type: "Vegetarian",
    meal: [],
    rating: 0,
    image: "",       // existing image URL (if any)
  });

  // image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ui state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // fetch existing
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/recipes/${id}`);
        const r = res.data?.recipe || {};

        setInputs({
          recipeId: r.recipeId || "",
          title: r.title || "",
          description: r.description || "",
          ingredients: Array.isArray(r.ingredients) ? r.ingredients.join(", ") : (r.ingredients || ""),
          type: r.type || "Vegetarian",
          meal: Array.isArray(r.meal) ? r.meal : (typeof r.meal === "string" ? r.meal.split(",").map(s=>s.trim()).filter(Boolean) : []),
          rating: Number(r.rating) || 0,
          image: r.image || "",
        });

        setImagePreview(r.image || null);
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        alert("Failed to load recipe.");
      }
    })();
  }, [id]);

  // -------- validation (same rules as AddRecipe) --------
  const validateForm = () => {
    const newErrors = {};

    if (!inputs.recipeId.trim()) {
      newErrors.recipeId = "Recipe ID is required";
    } else if (!/^[A-Za-z0-9-]+$/.test(inputs.recipeId)) {
      newErrors.recipeId = "Recipe ID can only contain letters, numbers, and hyphens";
    }

    if (!inputs.title.trim()) {
      newErrors.title = "Title is required";
    } else if (inputs.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!inputs.description.trim()) {
      newErrors.description = "Description is required";
    } else if (inputs.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (!inputs.ingredients.trim()) {
      newErrors.ingredients = "Ingredients are required";
    } else if (inputs.ingredients.split(",").filter((i) => i.trim()).length < 2) {
      newErrors.ingredients = "Please provide at least 2 ingredients separated by commas";
    }

    if (!inputs.type) {
      newErrors.type = "Please choose a type";
    }

    if (!Array.isArray(inputs.meal) || inputs.meal.length === 0) {
      newErrors.meal = "Please select at least one meal type";
    }

    // image is required for your schema; allow existing URL OR new upload, and enforce ≤ 5MB on new file
    if (!imageFile && !inputs.image) {
      newErrors.image = "Please upload an image";
    } else if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        newErrors.image = "Please select a valid image file";
      } else if (imageFile.size > 5 * 1024 * 1024) {
        newErrors.image = "Image must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- handlers --------
  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onMealToggle = (name) => {
    setInputs((s) => {
      const set = new Set(s.meal || []);
      set.has(name) ? set.delete(name) : set.add(name);
      return { ...s, meal: Array.from(set) };
    });
    if (errors.meal) setErrors((prev) => ({ ...prev, meal: "" }));
  };

  const onClearMeals = () => setInputs((s) => ({ ...s, meal: [] }));

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // live checks (same as final validation)
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setInputs((s) => ({ ...s, image: "" })); // forces user to pick a new image before saving
    setErrors((prev) => ({ ...prev, image: "Please upload an image" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let finalImageUrl = inputs.image;

      // upload only if a new file is chosen
      if (imageFile) {
        finalImageUrl = await MediaUpload(imageFile);
      }

      const payload = {
        recipeId: String(inputs.recipeId),
        image: finalImageUrl, // required by schema
        title: String(inputs.title),
        description: String(inputs.description),
        ingredients: String(inputs.ingredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        type: String(inputs.type),
        meal: Array.isArray(inputs.meal) ? inputs.meal : String(inputs.meal).split(",").map(s=>s.trim()).filter(Boolean),
        rating: Number(inputs.rating) || 0,
      };

      await axios.put(`http://localhost:3000/api/recipes/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      nav("/recipes");
    } catch (error) {
      console.error("Update failed:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update recipe. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------- UI --------
  return (
    <div>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Update Recipe
          </span>
        </h1>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          noValidate
        >
          <div className="bg-emerald-50/60 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-emerald-800">
              Edit details below. Fields marked * are required.
            </p>
            <button
              type="button"
              onClick={() => nav("/recipes")}
              className="text-emerald-700 text-sm hover:underline"
            >
              Back to list
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe ID *
                </label>
                <input
                  name="recipeId"
                  value={inputs.recipeId}
                  onChange={onChange}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.recipeId ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. RCP-1001"
                />
                {errors.recipeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipeId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  name="title"
                  value={inputs.title}
                  onChange={onChange}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. Creamy Pesto Pasta"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={inputs.description}
                  onChange={onChange}
                  className={`w-full min-h-28 rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Short description of the recipe..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients * (comma separated)
                </label>
                <textarea
                  name="ingredients"
                  value={inputs.ingredients}
                  onChange={onChange}
                  className={`w-full min-h-24 rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.ingredients ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="flour, sugar, eggs, milk"
                />
                {errors.ingredients && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ingredients}
                  </p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Image */}
              <div className="rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Type (radio) */}
              <div className={`rounded-xl border p-4 ${errors.type ? "border-red-500" : "border-gray-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Type *
                  </label>
                </div>
                <div className="flex gap-4">
                  {TYPE_OPTIONS.map((t) => (
                    <label key={t} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={inputs.type === t}
                        onChange={onChange}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Meal (checkbox) */}
              <div className={`rounded-xl border p-4 ${errors.meal ? "border-red-500" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Meal *
                  </label>
                  <button
                    type="button"
                    onClick={onClearMeals}
                    className="text-emerald-600 text-xs hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MEAL_OPTIONS.map((m) => (
                    <label key={m} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={inputs.meal.includes(m)}
                        onChange={() => onMealToggle(m)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{m}</span>
                    </label>
                  ))}
                </div>
                {errors.meal && (
                  <p className="mt-1 text-sm text-red-600">{errors.meal}</p>
                )}
              </div>

              {/* Rating */}
              <div className="rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (optional)
                </label>
                <StarRating
                  value={inputs.rating}
                  onChange={(n) => setInputs((s) => ({ ...s, rating: n }))}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav("/recipes")}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
                         bg-emerald-600 text-white shadow-sm shadow-emerald-200
                         hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
                         active:scale-[0.98] transition disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}