import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  FileSpreadsheet,
  FileText,
  Download,
  TrendingUp,
  Users,
  BookOpen,
  Eye,
  Calendar,
  Target,
  Award,
  Activity,
  ChevronRight,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

const TrainingReport = ({ onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Professional color palette
  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setReportData(generateMockData());
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [timeFilter]);

  const generateMockData = () => {
    const materials = [
      { title: 'Safety Training Module', category: 'Safety', type: 'Video', difficulty: 'Beginner', views: 1245, status: 'Active' },
      { title: 'Leadership Development', category: 'Management', type: 'Course', difficulty: 'Advanced', views: 892, status: 'Active' },
      { title: 'Customer Service Excellence', category: 'Customer Service', type: 'Interactive', difficulty: 'Intermediate', views: 756, status: 'Active' },
      { title: 'Technical Skills Assessment', category: 'Technical', type: 'Assessment', difficulty: 'Advanced', views: 634, status: 'Active' },
      { title: 'Communication Fundamentals', category: 'Soft Skills', type: 'Document', difficulty: 'Beginner', views: 523, status: 'Active' },
      { title: 'Project Management Basics', category: 'Management', type: 'Course', difficulty: 'Intermediate', views: 445, status: 'Active' },
      { title: 'Quality Assurance Protocol', category: 'Quality', type: 'Document', difficulty: 'Intermediate', views: 389, status: 'Active' },
      { title: 'Data Analysis Workshop', category: 'Technical', type: 'Workshop', difficulty: 'Advanced', views: 312, status: 'Active' }
    ];

    const categoryData = [
      { name: 'Safety', value: 3, percentage: '25.0' },
      { name: 'Management', value: 2, percentage: '16.7' },
      { name: 'Technical', value: 2, percentage: '16.7' },
      { name: 'Customer Service', value: 2, percentage: '16.7' },
      { name: 'Soft Skills', value: 2, percentage: '16.7' },
      { name: 'Quality', value: 1, percentage: '8.3' }
    ];

    const typeData = [
      { name: 'Video', value: 3, views: 1245 },
      { name: 'Course', value: 2, views: 1337 },
      { name: 'Interactive', value: 1, views: 756 },
      { name: 'Assessment', value: 1, views: 634 },
      { name: 'Document', value: 2, views: 912 },
      { name: 'Workshop', value: 1, views: 312 }
    ];

    const difficultyData = [
      { name: 'Beginner', value: 2 },
      { name: 'Intermediate', value: 3 },
      { name: 'Advanced', value: 3 }
    ];

    const monthlyTrend = [
      { month: 'Apr', materials: 45, views: 2100, users: 85 },
      { month: 'May', materials: 52, views: 2800, users: 92 },
      { month: 'Jun', materials: 48, views: 3200, users: 88 },
      { month: 'Jul', materials: 61, views: 3800, users: 105 },
      { month: 'Aug', materials: 58, views: 4200, users: 98 },
      { month: 'Sep', materials: 64, views: 5196, users: 112 }
    ];

    const popularContent = materials.slice(0, 8);

    return {
      overview: {
        totalMaterials: materials.length,
        totalViews: 5196,
        avgViewsPerMaterial: Math.round(5196 / materials.length),
        categories: categoryData.length,
        mostViewedCategory: 'Safety'
      },
      categoryData,
      typeData,
      difficultyData,
      popularContent,
      monthlyTrend,
      materials
    };
  };

  const exportToCSV = async () => {
    if (!reportData || exporting) return;
    
    setExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate export
      
      const csvContent = [
        ['Training Materials Report', `Generated on: ${new Date().toLocaleDateString()}`],
        [],
        ['Material Name', 'Category', 'Type', 'Difficulty', 'Views', 'Status'],
        ...reportData.materials.map(material => [
          `"${material.title}"`,
          material.category,
          material.type,
          material.difficulty,
          material.views,
          material.status
        ]),
        [],
        ['Summary Statistics'],
        ['Total Materials', reportData.overview.totalMaterials],
        ['Total Views', reportData.overview.totalViews],
        ['Average Views per Material', reportData.overview.avgViewsPerMaterial],
        ['Categories', reportData.overview.categories],
        ['Most Viewed Category', reportData.overview.mostViewedCategory]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Training_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportData || exportingPDF) return;
    
    setExportingPDF(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training/export/pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Training_Materials_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('PDF export failed. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Generating Report</h3>
            <p className="text-slate-600 leading-relaxed">Analyzing training data and compiling comprehensive insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Unable to Load Report</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Training Analytics</h1>
              <p className="text-slate-300 text-lg">Comprehensive performance insights and reporting</p>
              <div className="text-sm text-slate-400 mt-3">
                Generated on {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-slate-300">Period:</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="7" className="text-slate-900">Last 7 days</option>
                  <option value="30" className="text-slate-900">Last 30 days</option>
                  <option value="90" className="text-slate-900">Last 90 days</option>
                  <option value="365" className="text-slate-900">Last year</option>
                </select>
              </div>
              
              <button
                onClick={exportToCSV}
                disabled={exporting || exportingPDF}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    Exporting CSV...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                  </>
                )}
              </button>
              
              <button
                onClick={exportToPDF}
                disabled={exporting || exportingPDF}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium"
              >
                {exportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    Exporting PDF...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white hover:bg-white/10 p-2.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          {reportData && (
            <div className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Materials</p>
                      <p className="text-3xl font-bold text-slate-900">{reportData.overview.totalMaterials}</p>
                      <p className="text-xs text-green-600 font-medium">+12% from last period</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Views</p>
                      <p className="text-3xl font-bold text-slate-900">{reportData.overview.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-green-600 font-medium">+24% from last period</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Avg Views/Material</p>
                      <p className="text-3xl font-bold text-slate-900">{reportData.overview.avgViewsPerMaterial}</p>
                      <p className="text-xs text-green-600 font-medium">+8% from last period</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Active Categories</p>
                      <p className="text-3xl font-bold text-slate-900">{reportData.overview.categories}</p>
                      <p className="text-xs text-slate-500 font-medium">Across all materials</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Content Distribution by Category</h3>
                    <p className="text-sm text-slate-600">Overview of training materials across different categories</p>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={reportData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {reportData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} materials`, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {reportData.categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                        <span className="text-xs text-slate-500">({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Types */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Materials by Content Type</h3>
                    <p className="text-sm text-slate-600">Distribution of different training material formats</p>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={reportData.typeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#0ea5e9" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">6-Month Performance Trends</h3>
                  <p className="text-sm text-slate-600">Material usage and engagement trends over the past six months</p>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={reportData.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="materials" 
                      stackId="2" 
                      stroke="#0ea5e9" 
                      fill="#0ea5e9" 
                      fillOpacity={0.4} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performing Content */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Top Performing Training Materials</h3>
                  <p className="text-sm text-slate-600">Most viewed and engaged content in your training library</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Rank</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Title</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Type</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Category</th>
                        <th className="text-right py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Views</th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.popularContent.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-900">{item.title}</div>
                            <div className="text-sm text-slate-500 mt-1">{item.difficulty} Level</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-slate-600 font-medium">{item.category}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-lg font-bold text-slate-900">{item.views.toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center">
                              {item.views > 800 ? (
                                <div className="flex items-center text-green-600">
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  <span className="text-xs font-medium">High</span>
                                </div>
                              ) : item.views > 400 ? (
                                <div className="flex items-center text-amber-600">
                                  <Activity className="h-4 w-4 mr-1" />
                                  <span className="text-xs font-medium">Medium</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-slate-500">
                                  <Activity className="h-4 w-4 mr-1" />
                                  <span className="text-xs font-medium">Low</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingReport;