// utils/reportGenerator.js
import PDFDocument from "pdfkit";

export const generatePDF = async (questions, res) => {
  const doc = new PDFDocument({ 
    size: "A4", 
    margin: 50,
    bufferPages: true 
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=qa_report.pdf");
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = 50;

  // Colors
  const colors = {
    primary: "#22c55e",
    success: "#16a34a",
    dark: "#1f2937",
    darkMedium: "#4b5563",
    gray: "#6b7280",
    border: "#d1d5db",
    greenLight: "#d1fae5",
    white: "#ffffff",
    red: "#ef4444",
    yellow: "#eab308"
  };

  // Calculate statistics
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => 
    q.adminReply && q.adminReply !== "Pending" && q.status === "Closed"
  ).length;
  const pendingQuestions = totalQuestions - answeredQuestions;

  // ---------- HEADER ----------
  const addHeader = () => {
    // Logo and Brand
    doc.fontSize(20)
       .fillColor(colors.primary)
       .font("Helvetica-Bold")
       .text("🌿 FarmNex", 50, y);

    // Report Title
    doc.fontSize(24)
       .fillColor(colors.primary)
       .font("Helvetica-Bold")
       .text("Q&A Report", 50, y + 30, { align: "center" });

    // Contact Details
    doc.fontSize(9)
       .fillColor(colors.gray)
       .font("Helvetica")
       .text("No 8, Temple Road, Beralapanathra, Sri Lanka", 50, y + 60, { align: "center" });
    
    doc.text("Tel: 0742331740 • Email: farmnex@gmail.com", 50, y + 72, { align: "center" });

    // Divider Line
    doc.moveTo(50, y + 90)
       .lineTo(pageWidth + 50, y + 90)
       .strokeColor(colors.border)
       .lineWidth(2)
       .stroke();

    y = y + 110;
  };

  // ---------- FOOTER ----------
  const addFooter = () => {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - 40;

      // Footer line
      doc.moveTo(50, bottom - 10)
         .lineTo(pageWidth + 50, bottom - 10)
         .strokeColor(colors.border)
         .lineWidth(1)
         .stroke();

      // Company info (left)
      doc.fontSize(7)
         .fillColor(colors.gray)
         .font("Helvetica")
         .text("FarmNex Farm Management System • No 8, Temple Road, Beralapanathra, Sri Lanka", 50, bottom, { 
           align: "left",
           width: pageWidth / 3
         });
      
      doc.text("Tel: 0742331740 • Email: farmnex@gmail.com", 50, bottom + 8, { 
        align: "left",
        width: pageWidth / 3
      });

      // Page number (center)
      doc.fontSize(9)
         .fillColor(colors.gray)
         .text(`Page ${i + 1} of ${range.count}`, 50, bottom + 4, { 
           align: "center", 
           width: pageWidth 
         });

      // Timestamp (right)
      doc.fontSize(8)
         .fillColor(colors.gray)
         .text(`Generated: ${new Date().toLocaleString()}`, 50, bottom + 4, { 
           align: "right", 
           width: pageWidth 
         });
    }
  };

  // ---------- SUMMARY SECTION ----------
  const drawSummary = () => {
    const boxWidth = (pageWidth - 20) / 3;
    const boxHeight = 60;
    const boxY = y;

    // Total Questions Box
    doc.roundedRect(50, boxY, boxWidth, boxHeight, 5)
       .fillAndStroke(colors.primary, colors.primary);
    
    doc.fontSize(22)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(totalQuestions.toString(), 50, boxY + 10, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Total Questions", 50, boxY + 38, { 
         width: boxWidth, 
         align: "center" 
       });

    // Answered Questions Box
    doc.roundedRect(50 + boxWidth + 10, boxY, boxWidth, boxHeight, 5)
       .fillAndStroke(colors.success, colors.success);
    
    doc.fontSize(22)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(answeredQuestions.toString(), 50 + boxWidth + 10, boxY + 10, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Answered", 50 + boxWidth + 10, boxY + 38, { 
         width: boxWidth, 
         align: "center" 
       });

    // Pending Questions Box
    doc.roundedRect(50 + (boxWidth + 10) * 2, boxY, boxWidth, boxHeight, 5)
       .fillAndStroke(colors.red, colors.red);
    
    doc.fontSize(22)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(pendingQuestions.toString(), 50 + (boxWidth + 10) * 2, boxY + 10, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Pending", 50 + (boxWidth + 10) * 2, boxY + 38, { 
         width: boxWidth, 
         align: "center" 
       });

    y += boxHeight + 30;
  };

  // ---------- Q&A CARD ----------
  const drawQACard = (q, index) => {
    const cardPadding = 15;
    const startY = y;

    // Check if we need a new page (more generous spacing)
    if (y + 250 > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    // Card Background with Border
    doc.roundedRect(50, y, pageWidth, 10, 5)
       .fillAndStroke(colors.greenLight, colors.border);

    // Question Number Header
    doc.fontSize(12)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .rect(50, y, pageWidth, 30)
       .fillAndStroke(colors.primary, colors.primary);
    
    doc.fillColor(colors.white)
       .text(`Question #${index + 1}`, 50 + cardPadding, y + 8, { width: pageWidth - cardPadding * 2 });

    y += 35;

    // Question Title
    doc.fontSize(14)
       .fillColor(colors.dark)
       .font("Helvetica-Bold")
       .text(q.title || "No Title", 50 + cardPadding, y, { width: pageWidth - cardPadding * 2 });
    
    y += doc.heightOfString(q.title || "No Title", { width: pageWidth - cardPadding * 2 }) + 10;

    // Asked By Section
    doc.fontSize(10)
       .fillColor(colors.darkMedium)
       .font("Helvetica-Bold")
       .text("Asked By: ", 50 + cardPadding, y, { continued: true })
       .font("Helvetica")
       .fillColor(colors.gray)
       .text(q.author?.fullName || "Unknown");

    y += 15;

    doc.font("Helvetica-Bold")
       .fillColor(colors.darkMedium)
       .text("Email: ", 50 + cardPadding, y, { continued: true })
       .font("Helvetica")
       .fillColor(colors.gray)
       .text(q.author?.email || "N/A");

    y += 15;

    doc.font("Helvetica-Bold")
       .fillColor(colors.darkMedium)
       .text("Asked On: ", 50 + cardPadding, y, { continued: true })
       .font("Helvetica")
       .fillColor(colors.gray)
       .text(q.createdAt ? new Date(q.createdAt).toLocaleString() : "N/A");

    y += 20;

    // Question Content
    if (q.content) {
      doc.fontSize(10)
         .fillColor(colors.darkMedium)
         .font("Helvetica-Bold")
         .text("Question Content:", 50 + cardPadding, y);
      
      y += 15;

      doc.fontSize(10)
         .fillColor(colors.dark)
         .font("Helvetica")
         .text(q.content, 50 + cardPadding, y, { 
           width: pageWidth - cardPadding * 2,
           align: "left"
         });

      y += doc.heightOfString(q.content, { width: pageWidth - cardPadding * 2 }) + 15;
    }

    // Image Indicator
    if (q.image) {
      doc.fontSize(9)
         .fillColor(colors.success)
         .font("Helvetica-Bold")
         .text("📷 Image Attached", 50 + cardPadding, y);
      y += 15;
    }

    // Check for page break before reply section
    if (y + 150 > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    // Reply Section (with different background)
    const replyStartY = y;
    const hasReply = q.adminReply && q.adminReply !== "Pending";

    doc.roundedRect(50 + cardPadding, y, pageWidth - cardPadding * 2, 5, 3)
       .fillAndStroke(hasReply ? "#ecfdf5" : "#fef2f2", colors.border);

    y += 10;

    // Status Badge with proper color
    const status = q.status || "Open";
    let statusText = status;
    let statusColor = colors.red; // Default: red for pending/open
    
    if (status === "Closed" || status === "answered") {
      statusColor = colors.success; // Green for answered/closed
      statusText = "answered";
    } else if (status === "Open" || status === "Pending") {
      statusColor = colors.red; // Red for pending/open
      statusText = "pending";
    }
    
    doc.fontSize(9)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .roundedRect(50 + cardPadding + 5, y, 70, 18, 3)
       .fillAndStroke(statusColor, statusColor);
    
    doc.fillColor(colors.white)
       .text(`Status: ${statusText}`, 50 + cardPadding + 10, y + 4, { width: 60 });

    y += 25;

    // Reply Content
    doc.fontSize(10)
       .fillColor(colors.darkMedium)
       .font("Helvetica-Bold")
       .text("Admin Reply:", 50 + cardPadding + 5, y);
    
    y += 15;

    const replyText = q.adminReply || "Pending...";
    doc.fontSize(10)
       .fillColor(colors.dark)
       .font("Helvetica")
       .text(replyText, 50 + cardPadding + 5, y, { 
         width: pageWidth - cardPadding * 2 - 10,
         align: "left"
       });

    y += doc.heightOfString(replyText, { width: pageWidth - cardPadding * 2 - 10 }) + 15;

    // Replied By Info
    if (hasReply) {
      doc.fontSize(9)
         .fillColor(colors.gray)
         .font("Helvetica")
         .text(`Replied by: ${q.repliedBy?.fullName || "N/A"} (${q.repliedBy?.email || "N/A"})`, 
               50 + cardPadding + 5, y);
      
      y += 12;

      doc.text(`Replied on: ${q.repliedAt ? new Date(q.repliedAt).toLocaleString() : "N/A"}`, 
               50 + cardPadding + 5, y);
      
      y += 15;
    } else {
      y += 10;
    }

    // Calculate reply section height
    const replyHeight = y - replyStartY;
    doc.roundedRect(50 + cardPadding, replyStartY, pageWidth - cardPadding * 2, replyHeight, 3)
       .stroke(colors.border);

    // Card bottom margin
    y += 20;

    // Complete card border
    const cardHeight = y - startY;
    doc.roundedRect(50, startY, pageWidth, cardHeight, 5)
       .stroke(colors.border);

    y += 10; // Space between cards
  };

  // ---------- GENERATE PDF ----------
  addHeader();
  
  // Add Summary Statistics
  drawSummary();

  // Draw each Q&A card
  questions.forEach((q, index) => {
    drawQACard(q, index);
  });

  // Add footers to all pages at the end
  addFooter();

  doc.end();
};