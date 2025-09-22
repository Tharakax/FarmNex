import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import Navigation from "../navigation";

const API_URL = "http://localhost:3000/api/notifications";

const AUDIENCE_OPTIONS = [
  { value: "FARMER", label: "Farmer" },
  { value: "USER", label: "User" },
  { value: "BOTH", label: "Both" }
];

const TYPE_OPTIONS = [
  { value: "ALERT", label: "Alert" },
  { value: "OFFER", label: "Offer" },
  { value: "UPDATE", label: "Update" }
];

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" }
];

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL);
      setNotifications(res.data.notifications || []);
      setFilteredNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let results = notifications;
    
    if (searchTerm) {
      results = results.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.notificationId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedAudiences.length > 0) {
      results = results.filter(notification => 
        selectedAudiences.includes(notification.audience)
      );
    }
    
    if (selectedTypes.length > 0) {
      results = results.filter(notification => 
        selectedTypes.includes(notification.type)
      );
    }
    
    if (selectedPriorities.length > 0) {
      results = results.filter(notification => 
        selectedPriorities.includes(notification.priority)
      );
    }
    
    setFilteredNotifications(results);
  }, [notifications, searchTerm, selectedAudiences, selectedTypes, selectedPriorities]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleAudience = (audience) => {
    setSelectedAudiences(prev => 
      prev.includes(audience) 
        ? prev.filter(a => a !== audience) 
        : [...prev, audience]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const togglePriority = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority) 
        : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAudiences([]);
    setSelectedTypes([]);
    setSelectedPriorities([]);
  };

  const hasActiveFilters = searchTerm || selectedAudiences.length > 0 || 
                          selectedTypes.length > 0 || selectedPriorities.length > 0;

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 pt-30 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Notification Management
            </span>
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                         bg-white text-gray-700 border border-gray-300 shadow-sm
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {selectedAudiences.length + selectedTypes.length + selectedPriorities.length + (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 
                         shadow-sm w-full md:w-60"
            />

            <Link to="/notifications/add">
              <button
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                           bg-emerald-600 text-white shadow-sm shadow-emerald-200
                           hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
                           active:scale-[0.98] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="CurrentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Notification
              </button>
            </Link>
          </div>
        </div>
        

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
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
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Audience</h3>
                  <div className="space-y-2">
                    {AUDIENCE_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAudiences.includes(option.value)}
                          onChange={() => toggleAudience(option.value)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Type</h3>
                  <div className="space-y-2">
                    {TYPE_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(option.value)}
                          onChange={() => toggleType(option.value)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Priority</h3>
                  <div className="space-y-2">
                    {PRIORITY_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPriorities.includes(option.value)}
                          onChange={() => togglePriority(option.value)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600">
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
                    {hasActiveFilters && ' (filtered)'}
                  </p>
                </div>

                <div className={filteredNotifications.length > 0 ? "grid gap-6 sm:grid-cols-1 lg:grid-cols-1" : ""}>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 极 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="mt-4 text-gray-500">No notifications found. Try adjusting your filters.</p>
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

export default NotificationList;