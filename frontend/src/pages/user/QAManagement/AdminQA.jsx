// frontend/src/pages/AdminQA.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { getQuestions, replyToQuestion, updateQuestion, deleteQuestion, generateReport } 
 from "../../../api/questionApi";

const AdminQA = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Image modal state
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(data);
      setFilteredQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter and sort questions
  useEffect(() => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === 'answered') {
      filtered = filtered.filter(q => q.adminReply);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(q => !q.adminReply);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOrder === 'pending-first') {
        if (!a.adminReply && b.adminReply) return -1;
        if (a.adminReply && !b.adminReply) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, statusFilter, sortOrder]);

  const handleReply = async (id) => {
    if (!replyText.trim()) {
      alert('Reply cannot be empty');
      return;
    }
    
    try {
      setReplyLoading(true);
      await replyToQuestion(id, replyText);
      setReplyingId(null);
      setReplyText('');
      fetchQuestions();
    } catch (err) {
      alert(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const startEdit = (q) => {
    setEditingId(q._id);
    setEditTitle(q.title);
    setEditContent(q.content);
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }
    
    try {
      await updateQuestion(id, { title: editTitle, content: editContent });
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this question? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await deleteQuestion(id);
      fetchQuestions();
      Swal.fire("Deleted!", "The question has been deleted.", "success");

    } catch (err) {
      console.error(err);
      Swal.fire("Error!", err.message || "Failed to delete question.", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionStats = () => {
    const total = questions.length;
    const answered = questions.filter(q => q.adminReply).length;
    const pending = total - answered;
    return { total, answered, pending };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/${cleanPath}`;
  };

  const openImageModal = (src, alt) => {
    setImageModal({ isOpen: true, src, alt });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, src: '', alt: '' });
  };

  const generatePDFReport = () => {
    const stats = getQuestionStats();
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const pdfContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmNex Q&A Report</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', Arial, sans-serif;
            background: #ffffff;
            color: #1f2937;
            line-height: 1.6;
        }

        :root {
            --primary: #22c55e;
            --success: #16a34a;
            --dark: #1f2937;
            --dark-medium: #4b5563;
            --gray: #6b7280;
            --border: #d1d5db;
            --green-light: #d1fae5;
        }

        .pdf-header {
            width: 100%;
            max-width: 210mm;
            padding: 15px;
            background: #ffffff;
            border-bottom: 2px solid var(--border);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            height: 120px;
        }

        .brand-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .logo-tile {
            width: 18px;
            height: 18px;
            background: var(--green-light);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-tile .fa-leaf {
            color: var(--success);
            font-size: 12px;
        }

        .brand-name {
            font-size: 20px;
            font-weight: bold;
            color: var(--primary);
            margin: 0;
            line-height: 1;
        }

        .title-section {
            text-align: center;
            margin: 10px 0;
        }

        .report-title {
            font-size: 26px;
            font-weight: bold;
            color: var(--primary);
            margin: 0 0 8px 0;
            line-height: 1.2;
        }

        .report-subtitle {
            font-size: 14px;
            color: var(--dark-medium);
            margin: 0 0 8px 0;
            line-height: 1.2;
        }

        .contact-details {
            text-align: center;
            font-size: 9px;
            color: var(--gray);
            line-height: 1.4;
        }

        .contact-line {
            margin: 2px 0;
        }

        .header-divider {
            width: 100%;
            height: 2px;
            background: var(--border);
            margin-top: 10px;
            border: none;
        }

        .pdf-footer {
            width: 100%;
            max-width: 210mm;
            height: 25px;
            background: #ffffff;
            border-top: 1px solid var(--border);
            padding: 0 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }

        .footer-left {
            display: flex;
            flex-direction: column;
            gap: 1px;
            font-size: 7px;
            color: var(--gray);
            line-height: 1.2;
        }

        .footer-center {
            font-size: 9px;
            color: var(--gray);
            text-align: center;
        }

        .footer-right {
            font-size: 8px;
            color: var(--gray);
            text-align: right;
        }

        .content {
            margin-top: 130px;
            margin-bottom: 40px;
            padding: 20px;
            max-width: 210mm;
        }

        .section-title {
            font-size: 20px;
            color: var(--primary);
            border-bottom: 3px solid var(--primary);
            padding-bottom: 10px;
            margin: 30px 0 20px 0;
            font-weight: bold;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .stat-card {
            background: var(--green-light);
            border: 2px solid var(--primary);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }

        .stat-label {
            font-size: 12px;
            color: var(--dark-medium);
            font-weight: bold;
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 32px;
            color: var(--primary);
            font-weight: bold;
        }

        .question-card {
            background: #ffffff;
            border: 2px solid var(--border);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border);
        }

        .question-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--dark);
            margin-bottom: 5px;
        }

        .question-meta {
            font-size: 10px;
            color: var(--gray);
            margin-bottom: 3px;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: bold;
        }

        .status-answered {
            background: #d1fae5;
            color: #16a34a;
        }

        .status-pending {
            background: #fef3c7;
            color: #d97706;
        }

        .question-content {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 12px;
            color: var(--dark);
            line-height: 1.6;
        }

        .reply-section {
            background: #d1fae5;
            border-left: 4px solid var(--success);
            padding: 12px;
            margin-top: 10px;
            border-radius: 6px;
        }

        .reply-label {
            font-size: 11px;
            font-weight: bold;
            color: var(--success);
            margin-bottom: 8px;
        }

        .reply-content {
            font-size: 12px;
            color: var(--dark);
            line-height: 1.6;
        }

        .no-reply {
            font-style: italic;
            color: var(--gray);
            font-size: 11px;
        }

        .summary-box {
            background: #f9fafb;
            border: 2px solid var(--border);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
        }

        .summary-item:last-child {
            border-bottom: none;
        }

        .summary-label {
            color: var(--dark-medium);
            font-weight: 600;
        }

        .summary-value {
            color: var(--dark);
            font-weight: bold;
        }

        @media print {
            .pdf-header {
                position: fixed;
                top: 0;
            }
            .pdf-footer {
                position: fixed;
                bottom: 0;
            }
            .content {
                margin-top: 130px;
                margin-bottom: 40px;
            }
        }
    </style>
</head>
<body>
    <header class="pdf-header">
        <div class="brand-row">
            <div class="logo-tile">
                <i class="fas fa-leaf"></i>
            </div>
            <h1 class="brand-name">FarmNex</h1>
        </div>
        <div class="title-section">
            <h2 class="report-title">Q&A Management Report</h2>
            <p class="report-subtitle">Comprehensive Overview of Farmer Questions & Admin Responses</p>
        </div>
        <div class="contact-details">
            <div class="contact-line">No 8, Temple Road, Beralapanathra, Sri Lanka</div>
            <div class="contact-line">Tel: 0742331740 • Email: farmnex@gmail.com</div>
        </div>
        <hr class="header-divider">
    </header>

    <main class="content">
        <h3 class="section-title">📊 Overview Statistics</h3>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Questions</div>
                <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Answered</div>
                <div class="stat-value">${stats.answered}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pending</div>
                <div class="stat-value">${stats.pending}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Response Rate</div>
                <div class="stat-value">${stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0}%</div>
            </div>
        </div>

        <div class="summary-box">
            <div class="summary-item">
                <span class="summary-label">Report Generated On:</span>
                <span class="summary-value">${reportDate}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Total Questions Received:</span>
                <span class="summary-value">${stats.total}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Questions Answered:</span>
                <span class="summary-value">${stats.answered}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Questions Awaiting Response:</span>
                <span class="summary-value">${stats.pending}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Overall Response Rate:</span>
                <span class="summary-value">${stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0}%</span>
            </div>
        </div>

        <h3 class="section-title">✅ Answered Questions</h3>
        ${questions
          .filter(q => q.adminReply)
          .map((q, index) => `
            <div class="question-card">
                <div class="question-header">
                    <div>
                        <div class="question-title">${index + 1}. ${q.title}</div>
                        <div class="question-meta">👤 Asked by: ${q.authorName}</div>
                        <div class="question-meta">📅 Date: ${formatDate(q.createdAt)}</div>
                    </div>
                    <span class="status-badge status-answered">✓ Answered</span>
                </div>
                <div class="question-content">
                    <strong>Question:</strong><br>
                    ${q.content}
                </div>
                <div class="reply-section">
                    <div class="reply-label">📝 Admin Reply (${q.repliedAt ? formatDate(q.repliedAt) : 'Date unavailable'})</div>
                    <div class="reply-content">${q.adminReply}</div>
                </div>
            </div>
        `).join('')}

        ${questions.filter(q => q.adminReply).length === 0 ? '<p style="text-align: center; color: #6b7280; padding: 20px;">No answered questions available.</p>' : ''}

        <h3 class="section-title">⏳ Pending Questions</h3>
        ${questions
          .filter(q => !q.adminReply)
          .map((q, index) => `
            <div class="question-card">
                <div class="question-header">
                    <div>
                        <div class="question-title">${index + 1}. ${q.title}</div>
                        <div class="question-meta">👤 Asked by: ${q.authorName}</div>
                        <div class="question-meta">📅 Date: ${formatDate(q.createdAt)}</div>
                    </div>
                    <span class="status-badge status-pending">⏳ Pending</span>
                </div>
                <div class="question-content">
                    <strong>Question:</strong><br>
                    ${q.content}
                </div>
                <div class="reply-section">
                    <div class="no-reply">⚠️ Awaiting admin response</div>
                </div>
            </div>
        `).join('')}

        ${questions.filter(q => !q.adminReply).length === 0 ? '<p style="text-align: center; color: #6b7280; padding: 20px;">No pending questions. All questions have been answered!</p>' : ''}

    </main>

    <footer class="pdf-footer">
        <div class="footer-left">
            <div>FarmNex Farm Management System • No 8, Temple Road, Beralapanathra, Sri Lanka</div>
            <div>Tel: 0742331740 • Email: farmnex@gmail.com</div>
        </div>
        <div class="footer-center">
            Page 1 of 1
        </div>
        <div class="footer-right">
            Generated: ${new Date().toLocaleString()}
        </div>
    </footer>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const handleDownloadReport = async (format) => {
    if (format === 'pdf') {
      try {
        generatePDFReport();
      } catch (err) {
        Swal.fire('Error!', `Failed to generate PDF report: ${err.message}`, 'error');
      }
    } else if (format === 'excel') {
      try {
        await generateReport(format);
      } catch (err) {
        Swal.fire('Error!', `Failed to generate Excel report: ${err.message}`, 'error');
      }
    }
  };

  const stats = getQuestionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin
            </button>
          </div>
        </div>
      </div>

      {/* Page Title Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Admin Q&A Panel</h3>
            <p className="text-gray-600">Manage farmer questions and replies</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Answered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.answered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Filters & Actions
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Search */}
              <div className="lg:col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Questions</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, content, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-colors duration-200"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-blue-200 rounded-lg py-2 px-3 transition-colors duration-200"
                >
                  <option value="all">All Questions</option>
                  <option value="pending">Pending Reply</option>
                  <option value="answered">Answered</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-blue-200 rounded-lg py-2 px-3 transition-colors duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="pending-first">Pending First</option>
                </select>
              </div>

              {/* Report Downloads */}
              <div className="lg:col-span-4 flex gap-2">
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('excel')}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-7 h-7 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Questions ({filteredQuestions.length})
            </h2>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && filteredQuestions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-200">
              <svg className="w-16 h-16 text-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.236-.18-6.1-.5C4.698 14.353 4 13.411 4 12.327V4.685c0-1.084.698-2.026 1.9-2.173C7.764 2.183 9.761 2 12 2s4.236.183 6.1.512C19.302 2.659 20 3.601 20 4.685v7.642c0 1.084-.698 2.026-1.9 2.173-.748.063-1.53.11-2.341.14" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No Questions Match Your Filters' : 'No Questions Yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Questions from farmers will appear here for you to respond to.'
                }
              </p>
            </div>
          )}

          {filteredQuestions.map((q) => (
            <div key={q._id} className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              {editingId === q._id ? (
                <div className="p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Edit Question</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-colors duration-200"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                      <textarea
                        rows="4"
                        className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-colors duration-200 resize-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleUpdate(q._id)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{q.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Asked by {q.authorName}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {formatDate(q.createdAt)}
                          </span>
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${q.adminReply ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {q.adminReply ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Answered
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Pending
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(q)}
                          className="p-2 text-green-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Question"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Question"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{q.content}</p>
                    </div>

                    {/* Image Display Section */}
                    {q.image && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          Attached Image
                        </h4>
                        <div className="bg-gray-100 p-2 rounded-lg inline-block">
                          <img
                            src={getImageUrl(q.image)}
                            alt={`Image for question: ${q.title}`}
                            className="max-w-xs max-h-48 rounded cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            onClick={() => openImageModal(getImageUrl(q.image), `Image for question: ${q.title}`)}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="hidden text-red-500 text-sm p-2">
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Image could not be loaded
                          </div>
                        </div>
                      </div>
                    )}

                    {q.adminReply && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <h4 className="font-semibold text-green-800">Admin Reply</h4>
                          <span className="ml-2 text-sm text-green-600">
                            {q.repliedAt ? formatDate(q.repliedAt) : 'Unknown date'}
                          </span>
                        </div>
                        <p className="text-green-700 whitespace-pre-wrap">{q.adminReply}</p>
                      </div>
                    )}
                  </div>

                  {replyingId === q._id ? (
                    <div className="bg-blue-50 border-t border-blue-200 p-6">
                      <h4 className="font-semibold text-green-800 mb-3">Write Your Reply</h4>
                      <textarea
                        rows="4"
                        className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-colors duration-200 resize-none"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response to the farmer here..."
                      />
                      <div className="flex gap-3 pt-3">
                        <button
                          onClick={() => handleReply(q._id)}
                          disabled={replyLoading}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {replyLoading ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    !q.adminReply && (
                      <div className="bg-gray-50 border-t border-gray-200 p-4">
                        <button
                          onClick={() => setReplyingId(q._id)}
                          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Reply to Question</span>
                        </button>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors duration-200"
              title="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQA;