import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function RecipeItem({ recipe, onDelete }) {
  const handleDelete = () => {
    if (window.confirm("Delete this recipe?")) onDelete?.(recipe._id);
  };

  const ingredientsText = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.join(", ")
    : recipe.ingredients;

  const meals = Array.isArray(recipe.meal)
    ? recipe.meal
    : typeof recipe.meal === "string"
    ? recipe.meal
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {recipe.image && (
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-44 w-full object-cover transition hover:scale-105"
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/600x400?text=No+Image")
            }
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {recipe.title}
          </h3>
          <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-100">
            {recipe.type || "Type"}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between">
          <StarRating value={Number(recipe.rating) || 0} readOnly size="sm" />
          {meals.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              {meals.slice(0, 3).map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                >
                  {m}
                </span>
              ))}
              {meals.length > 3 && (
                <span className="text-[11px] text-gray-500">
                  +{meals.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {ingredientsText && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500">Ingredients</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {ingredientsText}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Link
            to={`/recipes/edit/${recipe._id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
