// BACKEND/utils/reportGenerator.js
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

//  Generate PDF Report
export const generatePDF = (questions, res) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=qa_report.pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Q&A Report", { align: "center" });
  doc.moveDown();

  questions.forEach((q, index) => {
  const authorName = q.author?.fullName || "Unknown";
  const authorEmail = q.author?.email || "N/A";
  const repliedByName = q.repliedBy?.fullName || "N/A";
  const repliedByEmail = q.repliedBy?.email || "N/A";

  doc.fontSize(12).text(`${index + 1}. Question: ${q.title}`);
  doc.text(`   Asked by: ${authorName} (${authorEmail})`);
  doc.text(`   Content: ${q.content}`);
  if (q.image) {
    doc.text(`   Image: ${q.image}`);
  }
  doc.text(`   Reply: ${q.adminReply || "Pending"}`);
  if (q.repliedBy) {
    doc.text(`   Replied by: ${repliedByName} (${repliedByEmail})`);
  }
  doc.text(`   Status: ${q.status}`);
  doc.moveDown();
});

  doc.end();
};

// Generate Excel Report
export const generateExcel = async (questions, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Q&A Report");

  // Headers
  sheet.addRow([
    "No",
    "Question Title",
    "Asked By",
    "Email",
    "Content",
    "Image",
    "Reply",
    "Replied By",
    "Replied Email",
    "Status",
  ]);

  // Data
  questions.forEach((q, index) => {
    sheet.addRow([
      index + 1,
      q.title,
      q.author?.fullName || "",
      q.author?.email || "",
      q.content,
      q.image || "N/A",
      q.adminReply || "Pending",
      q.repliedBy?.fullName || "",
      q.repliedBy?.email || "",
      q.status,
    ]);
  });

  // Send Excel
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=qa_report.xlsx");
  await workbook.xlsx.write(res);
  res.end();
};


