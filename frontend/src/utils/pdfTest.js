import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const testPDFGeneration = () => {
  try {
    console.log('Testing jsPDF instantiation...');
    
    // Create a very simple PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    console.log('PDF created successfully');
    console.log('PDF methods available:', Object.getOwnPropertyNames(pdf));
    console.log('autoTable available:', typeof pdf.autoTable === 'function');
    
    // Add simple text
    pdf.setFontSize(16);
    pdf.text('PDF Test', 20, 20);
    
    // Test simple table if autoTable is available
    if (pdf.autoTable) {
      console.log('Testing autoTable...');
      pdf.autoTable({
        head: [['Name', 'Age', 'City']],
        body: [
          ['John', '25', 'New York'],
          ['Jane', '30', 'London']
        ],
        startY: 30
      });
      console.log('autoTable worked successfully');
    } else {
      console.log('autoTable not available');
      pdf.text('autoTable plugin not loaded', 20, 40);
    }
    
    // Save the test PDF
    pdf.save('test.pdf');
    
    return {
      success: true,
      message: 'PDF test successful',
      autoTableAvailable: typeof pdf.autoTable === 'function'
    };
    
  } catch (error) {
    console.error('PDF test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};
