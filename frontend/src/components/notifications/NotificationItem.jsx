import React from "react";
import { Link } from "react-router-dom";

export default function NotificationItem({ notification, onDelete }) {
  const handleDelete = () => {
    if (window.confirm("Delete this notification?")) onDelete?.(notification._id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ALERT": return "bg-red-50 text-red-700 border-red-100";
      case "OFFER": return "bg-green-50 text-green-700 border-green-100";
      case "UPDATE": return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getAudienceColor = (audience) => {
    switch (audience) {
      case "FARMER": return "bg-amber-50 text-amber-700 border-amber-100";
      case "USER": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "BOTH": return "bg-purple-50 text-purple-700 border-purple-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{notification.title}</h3>
          <div className="flex gap-2 shrink-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
              {notification.priority}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getTypeColor(notification.type)}`}>
              {notification.type}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">{notification.body}</p>

        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getAudienceColor(notification.audience)}`}>
            {notification.audience}
          </span>
          <span className="text-xs text-gray-500">
            ID: {notification.notificationId}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => window.location.href = `/notifications/edit/${notification._id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Edit
          </button>
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