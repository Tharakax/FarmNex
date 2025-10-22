import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo.jsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import {
  drawFarmNexPdfHeader,
  addFarmNexFooter,
  loadImageAsBase64,
  renderBarChartToDataUrl,
  renderDonutChartToDataUrl,
} from "../../utils/exportUtils.js";

import {
  User,
  Users,
  Plus,
  LogOut,
  Settings,
  Home,
  Sprout,
  BarChart3,
  BarChart,
  Bell,
  Search,
  Edit3,
  Trash2,
  Eye,
  UserPlus,
  Activity,
  MessageSquare,
  Megaphone,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import NotificationItem from "../../features/notifications/NotificationItem";

const API_URL = "http://localhost:3000/api/notifications";

const AUDIENCE_OPTIONS = [
  { value: "FARMER", label: "Farmer", desc: "FarmStaff & Manager" },
  { value: "USER", label: "User", desc: "Customer & DeliveryStaff" },
  { value: "BOTH", label: "Farmer & User", desc: "" },
];

const TYPE_OPTIONS = [
  { value: "ALERT", label: "🚨 Alert", desc: "Urgent notifications" },
  { value: "OFFER", label: "🎉 Offer", desc: "Special deals" },
  { value: "UPDATE", label: "📢 Update", desc: "General information" },
];

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "🔴 High", desc: "Immediate attention" },
  { value: "MEDIUM", label: "🟡 Medium", desc: "Moderate urgency" },
  { value: "LOW", label: "🟢 Low", desc: "General information" },
];

function NotificationList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [adminData, setAdminData] = useState({
    name: "Loading...",
    role: "System Administrator",
    email: "Loading...",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  });

  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          name:
            user.name ||
            user.fullName ||
            (user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : "Admin User"),
          role:
            user.role === "admin"
              ? "System Administrator"
              : user.role || "Administrator",
          email: user.email || "admin@farmnex.com",
          avatar:
            user.avatar ||
            user.profileImage ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        };
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return {
            name:
              payload.name ||
              payload.fullName ||
              (payload.firstName && payload.lastName
                ? `${payload.firstName} ${payload.lastName}`
                : "Admin User"),
            role:
              payload.role === "admin"
                ? "System Administrator"
                : payload.role || "Administrator",
            email: payload.email || "admin@farmnex.com",
            avatar:
              payload.avatar ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          };
        } catch (jwtError) {
          console.error("Error decoding JWT token:", jwtError);
        }
      }

      return {
        name: "Admin User",
        role: "System Administrator",
        email: "admin@farmnex.com",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return {
        name: "Admin User",
        role: "System Administrator",
        email: "admin@farmnex.com",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      };
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setAdminData(currentUser);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(API_URL, { headers });
      setNotifications(res.data.notifications || []);
      setFilteredNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let results = notifications || [];

    if (searchTerm) {
      results = results.filter(
        (notification) =>
          (notification.title &&
            notification.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (notification.body &&
            notification.body
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (notification.notificationId &&
            notification.notificationId
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedAudiences.length > 0) {
      results = results.filter(
        (notification) =>
          notification.audience &&
          selectedAudiences.includes(notification.audience)
      );
    }

    if (selectedTypes.length > 0) {
      results = results.filter(
        (notification) =>
          notification.type && selectedTypes.includes(notification.type)
      );
    }

    if (selectedPriorities.length > 0) {
      results = results.filter(
        (notification) =>
          notification.priority &&
          selectedPriorities.includes(notification.priority)
      );
    }

    setFilteredNotifications(results);
  }, [
    notifications,
    searchTerm,
    selectedAudiences,
    selectedTypes,
    selectedPriorities,
  ]);

  const handleDelete = async (id) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/${id}`, { headers });
      fetchNotifications();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleAudience = (audience) => {
    setSelectedAudiences((prev) =>
      prev.includes(audience)
        ? prev.filter((a) => a !== audience)
        : [...prev, audience]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePriority = (priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAudiences([]);
    setSelectedTypes([]);
    setSelectedPriorities([]);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedAudiences.length > 0 ||
    selectedTypes.length > 0 ||
    selectedPriorities.length > 0;

  



// PDF Download


const handleDownloadPDF = async () => {
  if (filteredNotifications.length === 0) {
    Swal.fire({
      title: 'No Data',
      text: 'There are no notifications to export.',
      icon: 'warning',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Branded header
    const headerBottomY = drawFarmNexPdfHeader(
      doc,
      "Notification Management Report",
      pageWidth,
      {
        align: "center",
        titleFontSize: 24,
        tileSize: 18,
        subtitle: `Total Notifications: ${filteredNotifications.length}`,
        titleColor: [34, 197, 94],
      }
    );

    // Meta line below header
    const metaY = headerBottomY + 8;
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    const now = new Date();
    doc.text(
      `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      15,
      metaY
    );
    doc.text(
      `Total Records: ${filteredNotifications.length}`,
      pageWidth - 15,
      metaY,
      { align: "right" }
    );

    // Prepare table data
    const rows = filteredNotifications.map((notification, index) => {
      const createdDate = notification.createdAt 
        ? new Date(notification.createdAt).toLocaleDateString()
        : 'N/A';
      
      return [
        index + 1,
        notification.title || 'No Title',
        notification.body ? doc.splitTextToSize(notification.body, 80) : 'No Content',
        notification.audience || 'N/A',
        notification.type || 'N/A',
        notification.priority || 'N/A',
        createdDate,
      ];
    });

    // adjusted column widths
    doc.autoTable({
      head: [["#", "Title", "Content", "Audience", "Type", "Priority", "Created"]],
      body: rows,
      startY: headerBottomY + 18,
      theme: "grid",
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        halign: 'center'
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: 'center'
      },
      alternateRowStyles: { 
        fillColor: [248, 249, 250] 
      },
      bodyStyles: { 
        valign: "middle",
        minCellHeight: 8,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 55, halign: 'center', fontStyle: "normal" },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' },
      },
      margin: { 
        left: 10, 
        right: 10, 
        top: headerBottomY + 16, 
        bottom: 30 
      },
      tableWidth: 'auto',
      didDrawPage: function(data) {
        addFarmNexFooter(doc, data);
      }
    });

    // Analytics Data Preparation
    try {
      const audienceMap = new Map();
      
      filteredNotifications.forEach((notification) => {
        const audience = notification.audience || "Unknown";
        audienceMap.set(audience, (audienceMap.get(audience) || 0) + 1);
      });

      const audienceSeries = Array.from(audienceMap.entries()).map(([name, value]) => ({
        label: name,
        value,
      }));

      
      // Page 2:
      doc.addPage();
      const hbAudience = drawFarmNexPdfHeader(
        doc,
        "Notification Analytics — Audience Distribution",
        pageWidth,
        {
          align: "center",
          titleFontSize: 22,
          tileSize: 16,
          titleColor: [34, 197, 94],
        }
      );
      
      const topPieY = hbAudience + 20;
      const pieSize_mm = Math.min(pageWidth - 50, 140);
      
      const audiencePieUrl = await renderDonutChartToDataUrl(audienceSeries, 900, {
        title: "Notifications by Audience",
        scale: 3,
        titleFontSize: 26,
        percentFontSize: 18,
        legendFontSize: 14,
        centerFontSize: 16,
        colors: [
          '#97cf8a',   
          '#b1dd9e', 
          '#315e26', 
          '#acd1af',
        ]
      });
      
      if (audiencePieUrl) {
        const x = (pageWidth - pieSize_mm) / 2;
        doc.addImage(audiencePieUrl, "PNG", x, topPieY, pieSize_mm, pieSize_mm);
      }

      // Page 3:
      doc.addPage();
      const hbSummary = drawFarmNexPdfHeader(
        doc,
        "Notification Summary Statistics",
        pageWidth,
        {
          align: "center",
          titleFontSize: 22,
          tileSize: 16,
          titleColor: [34, 197, 94],
        }
      );

      let summaryY = hbSummary + 25;
      
      // Main title
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text("Key Metrics Overview", pageWidth / 2, summaryY, { align: "center" });
      
      summaryY += 15;
      
      // Statistics
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      
      const statsLeft = [
        `Total Notifications: ${filteredNotifications.length}`,
        `Farmers: ${filteredNotifications.filter(n => n.audience === 'FARMER').length}`,
        `Users: ${filteredNotifications.filter(n => n.audience === 'USER').length}`,
        `Both: ${filteredNotifications.filter(n => n.audience === 'BOTH').length}`,
      ];

      const statsRight = [
        `Alerts: ${filteredNotifications.filter(n => n.type === 'ALERT').length}`,
        `Offers: ${filteredNotifications.filter(n => n.type === 'OFFER').length}`,
        `Updates: ${filteredNotifications.filter(n => n.type === 'UPDATE').length}`,
        `High Priority: ${filteredNotifications.filter(n => n.priority === 'HIGH').length}`,
        `Medium Priority: ${filteredNotifications.filter(n => n.priority === 'MEDIUM').length}`,
        `Low Priority: ${filteredNotifications.filter(n => n.priority === 'LOW').length}`,
      ];

      // Left
      statsLeft.forEach((stat, index) => {
        doc.text(stat, 40, summaryY + (index * 8));
      });

      // Right
      statsRight.forEach((stat, index) => {
        doc.text(stat, pageWidth - 40, summaryY + (index * 8), { align: "right" });
      });

      // Additional insights section
      summaryY += Math.max(statsLeft.length, statsRight.length) * 8 + 15;
      
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);
      doc.text("Quick Insights", pageWidth / 2, summaryY, { align: "center" });
      
      summaryY += 10;
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      const total = filteredNotifications.length;
      const farmerPercent = total > 0 ? ((filteredNotifications.filter(n => n.audience === 'FARMER').length / total) * 100).toFixed(1) : 0;
      const userPercent = total > 0 ? ((filteredNotifications.filter(n => n.audience === 'USER').length / total) * 100).toFixed(1) : 0;
      const bothPercent = total > 0 ? ((filteredNotifications.filter(n => n.audience === 'BOTH').length / total) * 100).toFixed(1) : 0;
      
      const insights = [
        `• ${farmerPercent}% of notifications target Farmers`,
        `• ${userPercent}% of notifications target Users`, 
        `• ${bothPercent}% of notifications target Both audiences`,
        `• Most common type: ${getMostCommonType(filteredNotifications)}`,
        `• Priority distribution: High (${filteredNotifications.filter(n => n.priority === 'HIGH').length}), Medium (${filteredNotifications.filter(n => n.priority === 'MEDIUM').length}), Low (${filteredNotifications.filter(n => n.priority === 'LOW').length})`
      ];

      insights.forEach((insight, index) => {
        if (summaryY + (index * 6) > pageHeight - 30) {
          return;
        }
        doc.text(insight, 30, summaryY + (index * 6));
      });

    } catch (e) {
      console.warn("Notification charts failed:", e);
    }

    //final footer
    addFarmNexFooter(doc);

    doc.save(`notifications-report-${new Date().toISOString().split('T')[0]}.pdf`);


  } catch (error) {
    console.error('PDF export failed:', error);
    Swal.fire({
      title: 'Export Failed',
      text: 'Failed to generate PDF report. Please try again.',
      icon: 'error',
      confirmButtonColor: '#3085d6',
    });
  }
};

const getMostCommonType = (notifications) => {
  const typeCount = {};
  notifications.forEach(notification => {
    const type = notification.type || 'Unknown';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  const mostCommon = Object.entries(typeCount).reduce((max, [type, count]) => {
    return count > max.count ? { type, count } : max;
  }, { type: 'None', count: 0 });
  
  return mostCommon.type;
};













  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("authToken");
        navigate("/");
        Swal.fire(
          "Logged out!",
          "You have been logged out successfully.",
          "success"
        );
      }
    });
  };




  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-green-600">
            <BrandLogo size={32} className="mr-2" />
            <h2 className="text-xl font-bold text-white">Farm Nex Admin</h2>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={adminData.avatar}
                alt="Admin"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {adminData.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {adminData.role}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <button
              onClick={() => navigate("/admin")}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === "/admin"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/admin/users")}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname.includes("/users")
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Manage User
            </button>

            <button
              onClick={() => navigate("/adduser")}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Plus className="mr-3 h-5 w-5" />
              Add User
            </button>

            <button
              onClick={() => navigate("/adminqa")}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Q&A Inbox
            </button>

            <button
              onClick={() => navigate("/admin/feedback")}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="mr-3 h-5 w-5" />
              Feedbacks
            </button>

            <button
              onClick={() => navigate("/notifications")}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname.includes("/notifications")
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Megaphone className="mr-3 h-5 w-5" />
              Notifications
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <BarChart className="mr-3 h-5 w-5" />
              Analytics
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight shrink-0">
                <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                  Notification Management
                </span>
              </h1>

              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 
                           shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
              {/* Download PDF Button */}
              {filteredNotifications.length > 0 && (
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                          border border-gray-300 bg-white text-gray-700 shadow-sm
                               hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500
                           active:scale-[0.98] transition whitespace-nowrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.586 6L12 2.414A2 2 0 0010.586 2H6zm4 5a.75.75 0 01.75.75V11h1.69a.75.75 0 01.53 1.28l-2.69 2.72a.75.75 0 01-1.06 0l-2.69-2.72a.75.75 0 01.53-1.28h1.69V7.75A.75.75 0 0110 7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download Report (PDF)
                </button>
              )}

              {/* Add Notification Button */}
              <Link to="/notifications/add">
                <button
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                           bg-emerald-600 text-white shadow-sm shadow-emerald-200
                           hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
                           active:scale-[0.98] transition whitespace-nowrap"
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
                  Add Notification
                </button>
              </Link>
            </div>
          </div>

          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
                     bg-white text-gray-700 border border-gray-300 shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedAudiences.length +
                  selectedTypes.length +
                  selectedPriorities.length +
                  (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Filters and Notification List */}
          <div className="flex flex-col md:flex-row gap-6">

            {/* Filters Sidebar */}
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
                  {/* Audience Filter */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Audience
                    </h3>
                    <div className="space-y-3">
                      {AUDIENCE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAudiences.includes(option.value)}
                            onChange={() => toggleAudience(option.value)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Type
                    </h3>
                    <div className="space-y-3">
                      {TYPE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(option.value)}
                            onChange={() => toggleType(option.value)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Priority
                    </h3>
                    <div className="space-y-3">
                      {PRIORITY_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPriorities.includes(option.value)}
                            onChange={() => togglePriority(option.value)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">
                      {filteredNotifications.length} notification
                      {filteredNotifications.length !== 1 ? "s" : ""} found
                      {hasActiveFilters && " (filtered)"}
                    </p>
                  </div>

                  <div
                    className={
                      filteredNotifications.length > 0
                        ? "grid gap-6 sm:grid-cols-1 lg:grid-cols-1"
                        : ""
                    }
                  >
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification._id || notification.id}
                          notification={notification}
                          onDelete={handleDelete}
                        />
                      ))
                    ) : (
                      <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        <p className="mt-4 text-gray-500">
                          No notifications found. Try adjusting your filters.
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
      </main>
    </div>
  );
}

export default NotificationList;