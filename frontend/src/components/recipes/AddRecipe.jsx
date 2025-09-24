import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../navigation";
import MediaUpload from "../../utils/medialUpload";
import { Clock, ChevronLeft } from 'lucide-react';

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert"];
const TYPE_OPTIONS = ["Vegetarian", "Non-Vegetarian"];

export default function AddRecipe() {
  const nav = useNavigate();
  const [inputs, setInputs] = useState({
    title: "",
    description: "",
    ingredients: "",
    type: "Vegetarian",
    meal: [],
    time: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};


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
    } else if (
      inputs.ingredients.split(",").filter((i) => i.trim()).length < 2
    ) {
      newErrors.ingredients =
        "Please provide at least 2 ingredients separated by commas";
    }

    if (inputs.meal.length === 0) {
      newErrors.meal = "Please select at least one meal type";
    }

    if (!inputs.time.trim()) {
      newErrors.time = "Please provide the time (e.g., 30 mins)";
    }

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs((s) => ({ ...s, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const onMealToggle = (name) => {
    setInputs((s) => {
      const set = new Set(s.meal);
      set.has(name) ? set.delete(name) : set.add(name);
      return { ...s, meal: Array.from(set) };
    });

    if (errors.meal) {
      setErrors((prev) => ({ ...prev, meal: "" }));
    }
  };

  const onClearMeals = () => setInputs((s) => ({ ...s, meal: [] }));

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = inputs.image;

      if (imageFile) {
        imageUrl = await MediaUpload(imageFile);
      } else if (!imageUrl) {
        imageUrl = "https://via.placeholder.com/600x400?text=Recipe";
      }

      const payload = {
        image: imageUrl,
        title: inputs.title,
        description: inputs.description,
        ingredients: inputs.ingredients,
        type: inputs.type,
        meal: Array.isArray(inputs.meal)
          ? inputs.meal
          : String(inputs.meal).split(","),
        time: inputs.time,
      };

      await axios.post("http://localhost:3000/api/recipes", payload, {
        headers: { "Content-Type": "application/json" },
      });

      nav("/recipes");
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to add recipe.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-36 md:pt-32">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => {
              try {
                if (window.history.length > 1) {
                  nav(-1);
                } else {
                  nav('/farmerdashboard?tab=recipes', { replace: true });
                }
              } catch (err) {
                nav('/farmerdashboard?tab=recipes', { replace: true });
              }
            }}
            className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Create Recipe
            </span>
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          noValidate
        >
          <div className="bg-emerald-50/60 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-emerald-800">
              Fill the details below. Fields marked * are required.
            </p>
            <button
              type="button"
              onClick={() => {
                setInputs({
                  title: "",
                  description: "",
                  ingredients: "",
                  type: "Vegetarian",
                  meal: [],
                  time: "",
                  image: "",
                });
                setErrors({});
                setImageFile(null);
                setImagePreview(null);
              }}
              className="text-emerald-700 text-sm hover:underline"
            >
              Reset form
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">

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

            <div className="space-y-6">
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
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
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
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  errors.meal ? "border-red-500" : "border-gray-200"
                }`}
              >
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="time"
                    value={inputs.time}
                    onChange={onChange}
                    className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      errors.time ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g. 30 mins"
                  />
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {['10 mins','20 mins','30 mins','45 mins','60 mins'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInputs((s) => ({ ...s, time: t }))}
                      className={`px-3 py-1 rounded-full text-xs border ${inputs.time===t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                )}
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
              {isSubmitting ? "Saving..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
