import React from "react";

/**
 * A11y-friendly star rating.
 * - value: number 0..5
 * - onChange: (n) => void
 * - size: "sm" | "md" | "lg"
 * - readOnly: boolean
 */
export default function StarRating({ value = 0, onChange, size = "md", readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  const sizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  const handleKey = (e, n) => {
    if (readOnly) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange?.(n);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange?.(Math.max(0, value - 1));
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange?.(Math.min(5, value + 1));
    }
  };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={filled}
            disabled={readOnly}
            tabIndex={readOnly ? -1 : 0}
            onClick={() => !readOnly && onChange?.(n)}
            onKeyDown={(e) => handleKey(e, n)}
            className={`transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded ${
              readOnly ? "cursor-default" : "cursor-pointer"
            }`}
            title={`${n} star${n > 1 ? "s" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill={filled ? "currentColor" : "none"}
              className={`${sizes[size]} ${filled ? "text-amber-400" : "text-gray-300"} stroke-2`}
              stroke={filled ? "none" : "#9CA3AF"}
            >
              <path
                strokeLinejoin="round"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.967 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.176 0l-2.802 2.035c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.379-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.17-3.292z"
              />
            </svg>
          </button>
        );
      })}
      {!readOnly && (
        <span className="ml-2 text-xs text-gray-500">{value ? `${value}/5` : "No rating"}</span>
      )}
    </div>
  );
}