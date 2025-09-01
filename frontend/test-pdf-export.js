import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Test PDF export functionality
const testPDFExport = () => {
  try {
    console.log('Testing PDF export...');
    
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add some basic content
    pdf.setFontSize(20);
    pdf.text('Test PDF Export', 20, 20);
    
    // Test auto table functionality
    const sampleData = [
      ['Product 1', 'Vegetables', '$10.00', '100'],
      ['Product 2', 'Fruits', '$15.00', '50'],
      ['Product 3', 'Dairy', '$5.00', '200']
    ];
    
    pdf.autoTable({
      head: [['Name', 'Category', 'Price', 'Stock']],
      body: sampleData,
      startY: 40
    });
    
    // Try to save the PDF
    pdf.save('test-export.pdf');
    console.log('PDF export test successful!');
    return true;
  } catch (error) {
    console.error('PDF export test failed:', error);
    return false;
  }
};

// Run the test
testPDFExport();
