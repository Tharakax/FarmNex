import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../../components/navigation";

const AUDIENCE_OPTIONS = ["FARMER", "USER", "BOTH"];
const TYPE_OPTIONS = ["ALERT", "OFFER", "UPDATE"];
const PRIORITY_OPTIONS = ["HIGH", "MEDIUM", "LOW"];

export default function AddNotification() {
  const nav = useNavigate();
  const [inputs, setInputs] = useState({
    title: "",
    body: "",
    audience: "USER",
    type: "UPDATE",
    priority: "MEDIUM",
    sendEmail: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

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
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setInputs((s) => ({ ...s, [name]: newValue }));

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
        title: inputs.title,
        body: inputs.body,
        audience: inputs.audience,
        type: inputs.type,
        priority: inputs.priority,
        sendEmail: inputs.sendEmail,
      };

      await axios.post("http://localhost:3000/api/notifications", payload, {
        headers: { "Content-Type": "application/json" },
      });

      nav("/notifications");
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to add notification.";

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
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav('/admin')}
            aria-label="Back to Admin Dashboard"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M10.53 4.47a.75.75 0 010 1.06L5.31 10.75H21a.75.75 0 010 1.5H5.31l5.22 5.22a.75.75 0 11-1.06 1.06l-6.5-6.5a.75.75 0 010-1.06l6.5-6.5a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Create Notification
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
                  body: "",
                  audience: "USER",
                  type: "UPDATE",
                  priority: "MEDIUM",
                  sendEmail: false,
                });
                setErrors({});
              }}
              className="text-emerald-700 text-sm hover:underline"
            >
              Reset form
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 gap-6">
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-lg">ℹ️</div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Auto-Generated ID</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      The notification ID will be automatically generated when you create the notification.
                      No need to provide one manually.
                    </p>
                  </div>
                </div>
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
                  <div className="flex flex-col gap-3">
                    {AUDIENCE_OPTIONS.map((a) => {
                      const audienceInfo = {
                        'FARMER': { desc: 'FarmStaff & Manager roles', icon: '🌾', label: 'Farmer' },
                        'USER': { desc: 'Customer & DeliveryStaff roles', icon: '🛒', label: 'User' },
                        'BOTH': { desc: '', icon: '👥', label: 'Farmer & User' },
                      };
                      return (
                        <label
                          key={a}
                          className="flex items-start gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="audience"
                            value={a}
                            checked={inputs.audience === a}
                            onChange={onChange}
                            className="h-4 w-4 accent-emerald-600 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{audienceInfo[a]?.icon} {audienceInfo[a]?.label || a}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {audienceInfo[a]?.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

               
                <div className="rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <div className="flex flex-col gap-2">
                    {TYPE_OPTIONS.map((t) => (
                      <label
                        key={t}
                        className="inline-flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="type"
                          value={t}
                          checked={inputs.type === t}
                          onChange={onChange}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                
                <div className="rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <div className="flex flex-col gap-2">
                    {PRIORITY_OPTIONS.map((p) => (
                      <label
                        key={p}
                        className="inline-flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={inputs.priority === p}
                          onChange={onChange}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email Notification Checkbox */}
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="sendEmail"
                    checked={inputs.sendEmail}
                    onChange={onChange}
                    className="h-5 w-5 accent-emerald-600 mt-0.5"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                      📧 Send Email Notifications
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      When enabled, this notification will also be sent via email to all users in the selected audience who have email notifications enabled.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Note:</strong> Email configuration must be set up in the server environment variables for this to work.
                    </div>
                  </div>
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
              {isSubmitting ? "Saving..." : "Create Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}