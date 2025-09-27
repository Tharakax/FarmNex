import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { drawFarmNexPdfHeader, drawSummaryBlock } from '../../utils/exportUtils';
import { productAPI } from '../../services/productAPI';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ProductReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productAPI.getAllProducts();
      
      if (result.success) {
        setProducts(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // PDF generation - capture the report card and export as A4 PDF
  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      const element = reportRef.current;
      if (!element) return;

      const { default: html2canvas } = await import('html2canvas');

      // Render full element (not just viewport) at high resolution
      const fullCanvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm
      const imgWidth = pageWidth - margin * 2; // mm

      // Add a summary first page
      const summary = {
        title: 'Product Report Summary',
        metrics: [
          { label: 'Total Products', value: stats.totalProducts },
          { label: 'Average Inventory', value: stats.averageInventory },
          { label: 'Out of Stock', value: stats.outOfStock },
        ],
        sections: ['Summary','Charts','Details']
      };
const headerBottomY = drawFarmNexPdfHeader(pdf, 'Product Report', pageWidth, { align: 'center', titleFontSize: 26, tileSize: 18 });
      drawSummaryBlock(pdf, headerBottomY + 8, pageWidth, summary);

      // Start a new page for the captured content
      pdf.addPage();

      // Compute how many pixels fit per PDF page at the chosen width
      const mmPerPx = imgWidth / fullCanvas.width; // mm per pixel when scaled to imgWidth
      const usablePageHeightMm = pageHeight - margin * 2;
      const sliceHeightPx = Math.floor(usablePageHeightMm / mmPerPx);

      let rendered = 0;
      let pageIndex = 0;

      while (rendered < fullCanvas.height) {
        // Create a slice of the full canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = fullCanvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, fullCanvas.height - rendered);
        const sliceCtx = sliceCanvas.getContext('2d');
        sliceCtx.drawImage(
          fullCanvas,
          0, rendered, // source x, y
          fullCanvas.width, sliceCanvas.height, // source w, h
          0, 0, // dest x, y
          fullCanvas.width, sliceCanvas.height // dest w, h
        );

        const sliceImg = sliceCanvas.toDataURL('image/png');
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(
          sliceImg,
          'PNG',
          margin,
          margin,
          imgWidth,
          (sliceCanvas.height * mmPerPx)
        );

        rendered += sliceCanvas.height;
        pageIndex += 1;
      }

      pdf.save('product-report.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Export Excel (Summary + Categories)
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['Metric', 'Value'],
        ['Total Products', stats.totalProducts],
        ['Average Inventory Per Product', stats.averageInventory],
        ['Out of Stock', stats.outOfStock],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const categoryData = [['Category', 'Inventory']];
      stats.topCategories.forEach(c => categoryData.push([c.name, c.inventory]));
      const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');

      XLSX.writeFile(wb, 'product-report.xlsx');
    } catch (err) {
      console.error('Error exporting Excel:', err);
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    let dataToUse = products;
    
    // If no products, use sample data for demonstration
    if (products.length === 0) {
      dataToUse = [
        { category: 'tomatoes', stock: { current: 9500 } },
        { category: 'lettuce', stock: { current: 3200 } },
        { category: 'carrots', stock: { current: 1800 } },
      ];
    }
    
    const totalProducts = products.length > 0 ? products.length : 150;
    
    // Calculate average inventory per product
    const totalInventory = dataToUse.reduce((sum, product) => {
      return sum + (product.stock?.current || 0);
    }, 0);
    const averageInventory = products.length > 0 
      ? (totalProducts > 0 ? Math.round(totalInventory / totalProducts) : 0)
      : 523;
    
    // Count out of stock products
    const outOfStock = products.length > 0 
      ? products.filter(product => (product.stock?.current || 0) === 0).length
      : 8;
    
    // Get top categories and their inventory counts
    const categoryInventory = dataToUse.reduce((acc, product) => {
      const category = product.category || 'uncategorized';
      const inventory = product.stock?.current || 0;
      acc[category] = (acc[category] || 0) + inventory;
      return acc;
    }, {});

    // Sort categories by inventory and get top 3
    const topCategories = Object.entries(categoryInventory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, inventory]) => ({ 
        name: category.charAt(0).toUpperCase() + category.slice(1),
        inventory 
      }));

    // Ensure we always have 3 categories for the chart
    while (topCategories.length < 3) {
      topCategories.push({ name: 'Other', inventory: 0 });
    }

    return {
      totalProducts,
      averageInventory,
      outOfStock,
      topCategories: topCategories.slice(0, 3)
    };
  }, [products]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Report</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={reportRef} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">FarmNex</h2>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Report</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${generatingPDF ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              title="Export PDF"
            >
              <FileText className="h-4 w-4" />
              {generatingPDF ? 'Generating…' : 'PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Export Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Total Products */}
          <div className="text-center sm:text-left">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          
          {/* Average Inventory */}
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-600 mb-1">Average Inventory</div>
            <div className="text-sm text-gray-600 mb-1">Per Product</div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.averageInventory}</div>
          </div>
          
          {/* Out of Stock */}
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-600 mb-1">Out of</div>
            <div className="text-sm text-gray-600 mb-1">Stock</div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.outOfStock}</div>
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Overview</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar chart: Inventory by Top Categories */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Top categories by inventory</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCategories.map(c => ({ name: c.name, inventory: c.inventory }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis stroke="#6b7280" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <Tooltip cursor={{ fill: 'rgba(16,185,129,0.08)' }} formatter={(v) => [v, 'Inventory']} />
                  <Legend />
                  <Bar dataKey="inventory" name="Inventory" radius={[4, 4, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart: Category Inventory Share */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Category inventory share</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend />
                  <Pie
                    data={stats.topCategories.map(c => ({ name: c.name, value: c.inventory }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    label
                  >
                    {stats.topCategories.map((entry, index) => {
                      const COLORS = ['#16a34a', '#10b981', '#22c55e'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReport;
