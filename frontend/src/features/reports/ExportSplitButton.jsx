import React from 'react';
import { FileText, FileSpreadsheet, ChevronDown, RefreshCw } from 'lucide-react';

const ExportSplitButton = ({ onGenerate, loading = false, className = '' }) => {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const handleClick = async (format) => {
    if (loading) return;
    close();
    await onGenerate(format);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        onClick={() => handleClick('pdf')}
        disabled={loading}
        className={`flex items-center justify-center px-4 py-3 rounded-l-xl font-semibold text-white transition-colors shadow ${
          loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
        title="Generate PDF"
        aria-label="Generate PDF"
      >
        {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5 mr-2" />}
        {loading ? 'Generating...' : 'Generate'}
      </button>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-3 py-3 rounded-r-xl border-l font-semibold transition-colors shadow ${
          loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
        title="More formats"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ChevronDown className="h-5 w-5" />
      </button>

      {open && !loading && (
        <div
          role="menu"
          aria-label="Export formats"
          className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg z-10"
          onMouseLeave={close}
        >
          <button
            role="menuitem"
            onClick={() => handleClick('pdf')}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-xl"
          >
            <FileText className="h-4 w-4 text-red-600" />
            <span>PDF</span>
          </button>
          <button
            role="menuitem"
            onClick={() => handleClick('excel')}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-xl"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span>Excel</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportSplitButton;
