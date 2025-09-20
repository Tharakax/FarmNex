import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../navigation";

const AUDIENCE_OPTIONS = ["FARMER", "USER", "BOTH"];
const TYPE_OPTIONS = ["ALERT", "OFFER", "UPDATE"];
const PRIORITY_OPTIONS = ["HIGH", "MEDIUM", "LOW"];

export default function UpdateNotification() {
  const nav = useNavigate();
  const { id } = useParams();

  const [inputs, setInputs] = useState({
    notificationId: "",
    title: "",
    body: "",
    audience: "USER",
    type: "UPDATE",
    priority: "MEDIUM",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/notifications/${id}`);
        const n = res.data?.notification || {};

        setInputs({
          notificationId: n.notificationId || "",
          title: n.title || "",
          body: n.body || "",
          audience: n.audience || "USER",
          type: n.type || "UPDATE",
          priority: n.priority || "MEDIUM",
        });
      } catch (err) {
        console.error("Failed to fetch notification:", err);
        alert("Failed to load notification.");
      }
    })();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!inputs.notificationId.trim()) {
      newErrors.notificationId = "Notification ID is required";
    } else if (!/^[A-Za-z0-9-]+$/.test(inputs.notificationId)) {
      newErrors.notificationId = "Notification ID can only contain letters, numbers, and hyphens";
    }

    if (!inputs.title.trim()) {
      newErrors.title = "Title is required";
    } else if (inputs.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    } else if (inputs.title.length > 120) {
      newErrors.title = "Title must be less than 120 characters";
    }

    if (!inputs.body.trim()) {
      newErrors.body = "Body is required";
    } else if (inputs.body.length < 5) {
      newErrors.body = "Body must be at least 5 characters long";
    } else if (inputs.body.length > 10000) {
      newErrors.body = "Body must be less than 10000 characters";
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
      const payload = {
        notificationId: inputs.notificationId,
        title: inputs.title,
        body: inputs.body,
        audience: inputs.audience,
        type: inputs.type,
        priority: inputs.priority,
      };

      await axios.put(`http://localhost:3000/api/notifications/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      nav("/notifications");
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to update notification.";

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Update Notification
          </span>
        </h1>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          noValidate
        >
          <div className="bg-emerald-50/60 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-emerald-800">
              Edit the details below. Fields marked * are required.
            </p>
            <button
              type="button"
              onClick={() => nav("/notifications")}
              className="text-emerald-700 text-sm hover:underline"
            >
              Back to list
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification ID *
                </label>
                <input
                  name="notificationId"
                  value={inputs.notificationId}
                  onChange={onChange}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.notificationId ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. NOT-1001"
                />
                {errors.notificationId && (
                  <p className="mt-1 text-sm text-red-600">{errors.notificationId}</p>
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
                  placeholder="e.g. System Maintenance Alert"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body *
                </label>
                <textarea
                  name="body"
                  value={inputs.body}
                  onChange={onChange}
                  className={`w-full min-h-28 rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.body ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Notification content..."
                />
                {errors.body && (
                  <p className="mt-1 text-sm text-red-600">{errors.body}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience *
                  </label>
                  <select
                    name="audience"
                    value={inputs.audience}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {AUDIENCE_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={inputs.type}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={inputs.priority}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav("/notifications")}
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
              {isSubmitting ? "Saving..." : "Update Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}