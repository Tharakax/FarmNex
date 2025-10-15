import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MediaUpload from "../../utils/medialUpload";
import { Clock } from "lucide-react";

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert"];
const TYPE_OPTIONS = ["Vegetarian", "Non-Vegetarian"];

export default function AddRecipe({ showHeader = true, publicView = false }) {
  const nav = useNavigate();
  const [inputs, setInputs] = useState({
    title: "",
    description: "",
    ingredients: "",
    type: "Vegetarian",
    meal: [],
    timeCount: "",
    timeUnit: "minutes",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [displayTime, setDisplayTime] = useState("");

  const validateForm = () => {
    const newErrors = {};

    // Title
    if (!inputs.title.trim()) {
      newErrors.title = "Title is required";
    } else if (!/^[A-Za-z\s'’\-.]+$/.test(inputs.title)) {
      newErrors.title = "Title can only contain letters and common symbols.";
    } else if (inputs.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    } else if (inputs.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    // Description
    if (!inputs.description.trim()) {
      newErrors.description = "Please enter a description for your recipe";
    } else if (!/^[A-Za-z0-9\s.,'’"!?:;()°×\-–\/\n]+$/.test(inputs.description)) {
      newErrors.description =
        "Description contains invalid characters. Use letters, numbers, and common punctuation only";
    } else if (inputs.description.length < 10) {
      newErrors.description =
        "Description is too short. Please write at least 10 characters";
    } else if (inputs.description.length > 1000) {
      newErrors.description =
        "Description is too long. Maximum 1000 characters allowed";
    }

    // Ingredients
    if (!inputs.ingredients.trim()) {
      newErrors.ingredients = "Ingredients are required";
    } else {
      const ingredientList = inputs.ingredients
        .split(",")
        .filter((i) => i.trim());
      if (ingredientList.length < 2) {
        newErrors.ingredients =
          "Please provide at least 2 ingredients separated by commas";
      } else if (ingredientList.length > 50) {
        newErrors.ingredients = "Maximum 50 ingredients allowed";
      }

      //ingredient length
      const longIngredient = ingredientList.find(
        (ing) => ing.trim().length > 20
      );
      if (longIngredient) {
        newErrors.ingredients = "Each ingredient must not exceed 20 characters";
      }
    }

    // Meal
    if (inputs.meal.length === 0) {
      newErrors.meal = "Please select at least one meal type";
    } else if (inputs.meal.length > 3) {
      newErrors.meal = "Maximum 3 meal types allowed";
    }

    // Time
    if (!inputs.timeCount.trim()) {
      newErrors.time = "Please provide the preparation time";
    } else {
      const timeValue = parseInt(inputs.timeCount);
      if (isNaN(timeValue) || timeValue <= 0) {
        newErrors.time = "Time must be a positive number";
      } else if (timeValue > 240) {
        newErrors.time = "Time value is too large";
      }
    }

    // Image
    if (!imageFile && !inputs.image) {
      newErrors.image = "Please upload an image";
    } else if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        newErrors.image = "Please select a valid image file (JPEG, PNG, etc.)";
      } else if (imageFile.size > 5 * 1024 * 1024) {
        newErrors.image = "Image must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTimeDisplay = (minutes) => {
    if (!minutes) return "";

    const mins = parseInt(minutes);
    if (isNaN(mins)) return "";

    if (mins < 60) {
      return `${mins} min${mins !== 1 ? "s" : ""}`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMinutes = mins % 60;

      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""}`;
      } else {
        return `${hours} h  ${remainingMinutes} min${
          remainingMinutes !== 1 ? "s" : ""
        }`;
      }
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "timeCount") {
      // Allow only digits and empty string
      if (value === "" || /^\d+$/.test(value)) {
        setInputs((s) => ({ ...s, [name]: value, timeUnit: "minutes" }));

        // Update display time
        if (value === "") {
          setDisplayTime("");
        } else {
          setDisplayTime(formatTimeDisplay(value));
        }
      }
    } else {
      setInputs((s) => ({ ...s, [name]: value }));
    }

    // Clear validation errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "timeCount" && errors.time) {
      setErrors((prev) => ({ ...prev, time: "" }));
    }
  };

  const onMealToggle = (name) => {
    setInputs((s) => {
      const set = new Set(s.meal);
      if (set.has(name)) {
        set.delete(name);
      } else {
        if (set.size >= 3) {
          setErrors((prev) => ({
            ...prev,
            meal: "Maximum 3 meal types allowed",
          }));
          return s;
        }
        set.add(name);
      }
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

  const setQuickTime = (minutes) => {
    setInputs((s) => ({
      ...s,
      timeCount: minutes.toString(),
      timeUnit: "minutes",
    }));
    setDisplayTime(formatTimeDisplay(minutes.toString()));

    if (errors.time) {
      setErrors((prev) => ({ ...prev, time: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          element.focus();
        }
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

      const formattedTime = displayTime;

      const payload = {
        image: imageUrl,
        title: inputs.title.trim(),
        description: inputs.description.trim(),
        ingredients: inputs.ingredients
          .split(",")
          .map((ing) => ing.trim())
          .filter((ing) => ing),
        type: inputs.type,
        meal: Array.isArray(inputs.meal)
          ? inputs.meal
          : String(inputs.meal).split(","),
        time: formattedTime,
        timeCount: parseInt(inputs.timeCount),
        timeUnit: "minutes",
      };

      await axios.post("http://localhost:3000/api/recipes", payload, {
        headers: { "Content-Type": "application/json" },
      });

      nav("/farmerdashboard?tab=recipes");
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

  const getCharacterCount = (field, max) => {
    const value = inputs[field] || "";
    return `${value.length}/${max}`;
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20">
        {/* Title */}
        <div className="text-center mb-8">
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
                  timeCount: "",
                  timeUnit: "minutes",
                  image: "",
                });
                setDisplayTime("");
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <span className="text-xs text-gray-500">
                    {getCharacterCount("title", 100)}
                  </span>
                </div>
                <input
                  name="title"
                  value={inputs.title}
                  onChange={onChange}
                  maxLength={100}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. Creamy Pasta"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <span className="text-xs text-gray-500">
                    {getCharacterCount("description", 1000)}
                  </span>
                </div>
                <textarea
                  name="description"
                  value={inputs.description}
                  onChange={onChange}
                  maxLength={1000}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Ingredients * (comma separated)
                  </label>
                  <span className="text-xs text-gray-500">
                    {getCharacterCount("ingredients", 2000)}
                  </span>
                </div>
                <textarea
                  name="ingredients"
                  value={inputs.ingredients}
                  onChange={onChange}
                  maxLength={2000}
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
                <p className="mt-1 text-xs text-gray-500">
                  Separate ingredients with commas. Minimum 2 ingredients,
                  maximum 50.
                </p>
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
                <p className="mt-1 text-xs text-gray-500">
                  Maximum file size: 5MB. Supported formats: JPEG, PNG, etc.
                </p>
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
                    Meal *{" "}
                    {inputs.meal.length > 0 && `(${inputs.meal.length}/3)`}
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
                        disabled={
                          !inputs.meal.includes(m) && inputs.meal.length >= 3
                        }
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      <span
                        className={`text-sm ${
                          !inputs.meal.includes(m) && inputs.meal.length >= 3
                            ? "text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {m}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.meal && (
                  <p className="mt-1 text-sm text-red-600">{errors.meal}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select 1-3 meal types
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time (minutes) *
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      name="timeCount"
                      value={inputs.timeCount}
                      onChange={onChange}
                      maxLength={4}
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                        errors.time ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g. 30"
                    />
                  </div>
                </div>

                {displayTime && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800 font-medium">
                      Time: {displayTime}
                    </p>
                  </div>
                )}

                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                )}

                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                  <div className="flex gap-5 flex-wrap">
                    {[10, 15, 30, 45].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setQuickTime(minutes)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          inputs.timeCount === minutes.toString()
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {minutes}m
                      </button>
                    ))}
                    {[60, 120].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setQuickTime(minutes)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          inputs.timeCount === minutes.toString()
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {formatTimeDisplay(minutes)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav("/farmerdashboard?tab=recipes")}
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