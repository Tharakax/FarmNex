// utils/reportGenerator.js
import PDFDocument from "pdfkit";

export const generatePDF = async (questions, res) => {
  const doc = new PDFDocument({ 
    size: "A4", 
    margin: 50,
    bufferPages: true 
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=farmnex_qa_report.pdf");
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = 50;

  // FarmNex Brand Colors
  const colors = {
    primary: "#22c55e",        // Professional Green
    success: "#16a34a",        // Success Green
    dark: "#1f2937",           // Dark Text
    darkMedium: "#4b5563",     // Medium Dark
    gray: "#6b7280",           // Professional Gray
    border: "#d1d5db",         // Border Gray
    greenLight: "#d1fae5",     // Light Green Background
    white: "#ffffff",
    red: "#ef4444",
    yellow: "#eab308",
    lightBg: "#f9fafb"
  };

  // Calculate statistics
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => 
    q.adminReply && q.adminReply !== "Pending" && q.status === "Closed"
  ).length;
  const pendingQuestions = totalQuestions - answeredQuestions;
  const responseRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // ========== HEADER FUNCTION ==========
  const addHeader = () => {
    // Logo Tile (Green square with leaf icon)
    doc.rect(50, y, 18, 18)
       .fillAndStroke(colors.greenLight, colors.success);
    
    doc.fontSize(10)
       .fillColor(colors.success)
       .font("Helvetica-Bold")
       .text("🌿", 54, y + 3);

    // FarmNex Brand Name
    doc.fontSize(20)
       .fillColor(colors.primary)
       .font("Helvetica-Bold")
       .text("FarmNex", 73, y);

    y += 35;

    // Report Title
    doc.fontSize(26)
       .fillColor(colors.primary)
       .font("Helvetica-Bold")
       .text("Q&A Report", 50, y, { align: "center", width: pageWidth });

    y += 35;

    // Report Subtitle
    doc.fontSize(14)
       .fillColor(colors.darkMedium)
       .font("Helvetica")
       .text("Manage farmer questions and replies", 50, y, { align: "center", width: pageWidth });

    y += 25;

    // Contact Details
    doc.fontSize(9)
       .fillColor(colors.gray)
       .font("Helvetica")
       .text("No 8, Temple Road, Beralapanathra, Sri Lanka", 50, y, { align: "center", width: pageWidth });
    
    y += 12;
    
    doc.text("Tel: 0742331740 • Email: farmnex@gmail.com", 50, y, { align: "center", width: pageWidth });

    y += 20;

    // Divider Line
    doc.moveTo(50, y)
       .lineTo(pageWidth + 50, y)
       .strokeColor(colors.border)
       .lineWidth(2)
       .stroke();

    y += 20;
  };

  // ========== FOOTER FUNCTION ==========
  const addFooter = () => {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - 35;

      // Footer line
      doc.moveTo(50, bottom - 5)
         .lineTo(pageWidth + 50, bottom - 5)
         .strokeColor(colors.border)
         .lineWidth(1)
         .stroke();

      // Company info (left side)
      doc.fontSize(7)
         .fillColor(colors.gray)
         .font("Helvetica")
         .text("FarmNex Farm Management System • No 8, Temple Road, Beralapanathra, Sri Lanka", 50, bottom + 2, { 
           align: "left",
           width: pageWidth * 0.4
         });
      
      doc.fontSize(7)
         .text("Tel: 0742331740 • Email: farmnex@gmail.com", 50, bottom + 10, { 
           align: "left",
           width: pageWidth * 0.4
         });

      // Page number (center)
      doc.fontSize(9)
         .fillColor(colors.gray)
         .font("Helvetica")
         .text(`Page ${i + 1} of ${range.count}`, 50, bottom + 5, { 
           align: "center", 
           width: pageWidth 
         });

      // Timestamp (right side)
      doc.fontSize(8)
         .fillColor(colors.gray)
         .text(`Generated: ${new Date().toLocaleString('en-US', { 
           year: 'numeric', 
           month: 'short', 
           day: 'numeric', 
           hour: '2-digit', 
           minute: '2-digit'
         })}`, 50, bottom + 5, { 
           align: "right", 
           width: pageWidth 
         });
    }
  };

  // ========== SUMMARY STATISTICS BOXES ==========
  const drawSummary = () => {
    const boxWidth = (pageWidth - 30) / 4; // 4 boxes with 10px spacing
    const boxHeight = 80;
    const boxY = y;
    const iconSize = 24;

    // Box 1: Total Questions (Blue/Green)
    doc.roundedRect(50, boxY, boxWidth, boxHeight, 8)
       .fillAndStroke(colors.primary, colors.primary);
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("💬", 50 + (boxWidth - 20) / 2, boxY + 10, { width: 20, align: "center" });
    
    doc.fontSize(32)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(totalQuestions.toString(), 50, boxY + 30, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(10)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Total Questions", 50, boxY + 62, { 
         width: boxWidth, 
         align: "center" 
       });

    // Box 2: Answered (Green)
    const box2X = 50 + boxWidth + 10;
    doc.roundedRect(box2X, boxY, boxWidth, boxHeight, 8)
       .fillAndStroke(colors.success, colors.success);
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .text("✅", box2X + (boxWidth - 20) / 2, boxY + 10, { width: 20, align: "center" });
    
    doc.fontSize(32)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(answeredQuestions.toString(), box2X, boxY + 30, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(10)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Answered", box2X, boxY + 62, { 
         width: boxWidth, 
         align: "center" 
       });

    // Box 3: Pending (Yellow/Warning)
    const box3X = 50 + (boxWidth + 10) * 2;
    doc.roundedRect(box3X, boxY, boxWidth, boxHeight, 8)
       .fillAndStroke(colors.yellow, colors.yellow);
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .text("⚠️", box3X + (boxWidth - 20) / 2, boxY + 10, { width: 20, align: "center" });
    
    doc.fontSize(32)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(pendingQuestions.toString(), box3X, boxY + 30, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(10)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Pending", box3X, boxY + 62, { 
         width: boxWidth, 
         align: "center" 
       });

    // Box 4: Response Rate (Purple)
    const box4X = 50 + (boxWidth + 10) * 3;
    doc.roundedRect(box4X, boxY, boxWidth, boxHeight, 8)
       .fillAndStroke("#8b5cf6", "#8b5cf6");
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .text("📊", box4X + (boxWidth - 20) / 2, boxY + 10, { width: 20, align: "center" });
    
    doc.fontSize(32)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(`${responseRate}%`, box4X, boxY + 30, { 
         width: boxWidth, 
         align: "center" 
       });
    
    doc.fontSize(10)
       .fillColor(colors.white)
       .font("Helvetica")
       .text("Response Rate", box4X, boxY + 62, { 
         width: boxWidth, 
         align: "center" 
       });

    y += boxHeight + 40;
  };

  // ========== Q&A CARD WITH COMPLETE DETAILS ==========
  const drawQACard = (q, index) => {
    const cardPadding = 20;
    const startY = y;
    const contentWidth = pageWidth - (cardPadding * 2);

    // Check if we need a new page
    if (y + 300 > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    // Card Header (Question Number)
    doc.roundedRect(50, y, pageWidth, 35, 8)
       .fillAndStroke(colors.primary, colors.primary);
    
    doc.fontSize(14)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(`Question #${index + 1}`, 50 + cardPadding, y + 10);

    y += 45;

    // Question Title Section
    doc.fontSize(16)
       .fillColor(colors.dark)
       .font("Helvetica-Bold")
       .text(q.title || "No Title Provided", 50 + cardPadding, y, { 
         width: contentWidth,
         lineGap: 2
       });
    
    const titleHeight = doc.heightOfString(q.title || "No Title Provided", { width: contentWidth });
    y += titleHeight + 20;

    // Metadata Section (Asked By, Email, Date)
    const metaStartY = y;
    
    // Row 1: Asked By
    doc.fontSize(10)
       .fillColor(colors.darkMedium)
       .font("Helvetica-Bold")
       .text("Asked By: ", 50 + cardPadding, y, { continued: true })
       .font("Helvetica")
       .fillColor(colors.gray)
       .text(q.author?.fullName || "Unknown User");

    y += 16;

    // Row 2: Email
    doc.fontSize(10)
       .fillColor(colors.darkMedium)
       .font("Helvetica-Bold")
       .text("Email: ", 50 + cardPadding, y, { continued: true })
       .font("Helvetica")
       .fillColor(colors.gray)
       .text(q.author?.email || "Not provided");

    y += 16;

    // Row 3: Date
    doc.fontSize(10)
       .fillColor(colors.darkMedium)
       .font("Helvetica-Bold")
       .text("Asked On: ", 50 + cardPadding, y, { continued: true })
       .font("Helvetica")
       .fillColor(colors.gray)
       .text(q.createdAt ? new Date(q.createdAt).toLocaleString('en-US', { 
         year: 'numeric', 
         month: 'short', 
         day: 'numeric', 
         hour: '2-digit', 
         minute: '2-digit'
       }) : "Date not available");

    y += 25;

    // Question Content Box
    if (q.content) {
      // Light gray background box for content
      const contentBoxY = y;
      
      doc.fontSize(10)
         .fillColor(colors.darkMedium)
         .font("Helvetica-Bold")
         .text("Question Content:", 50 + cardPadding, y);
      
      y += 18;

      // Content text with background
      const questionContent = q.content;
      const contentTextY = y;
      
      doc.fontSize(10)
         .fillColor(colors.dark)
         .font("Helvetica")
         .text(questionContent, 50 + cardPadding, y, { 
           width: contentWidth,
           align: "left",
           lineGap: 3
         });

      const contentTextHeight = doc.heightOfString(questionContent, { width: contentWidth });
      
      // Draw background rectangle for content
      doc.rect(50 + cardPadding - 5, contentBoxY - 5, contentWidth + 10, contentTextHeight + 30)
         .fillOpacity(0.5)
         .fillAndStroke(colors.lightBg, colors.border)
         .fillOpacity(1);
      
      // Redraw text on top of background
      doc.fontSize(10)
         .fillColor(colors.darkMedium)
         .font("Helvetica-Bold")
         .text("Question Content:", 50 + cardPadding, contentBoxY);
      
      doc.fontSize(10)
         .fillColor(colors.dark)
         .font("Helvetica")
         .text(questionContent, 50 + cardPadding, contentTextY, { 
           width: contentWidth,
           align: "left",
           lineGap: 3
         });

      y += contentTextHeight + 25;
    }

    // Image Indicator
    if (q.image) {
      doc.fontSize(10)
         .fillColor(colors.success)
         .font("Helvetica-Bold")
         .text("📷 Image Attached to Question", 50 + cardPadding, y);
      y += 20;
    }

    // Check for page break before reply section
    if (y + 180 > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    // Reply Section Background
    const replyStartY = y;
    const hasReply = q.adminReply && q.adminReply !== "Pending" && q.status === "Closed";
    
    // Status Badge
    const status = q.status || "Open";
    let statusText = status === "Closed" ? "ANSWERED" : "PENDING";
    let statusColor = status === "Closed" ? colors.success : colors.red;
    let statusIcon = status === "Closed" ? "✓" : "⏳";
    
    doc.roundedRect(50 + cardPadding, y, 110, 24, 4)
       .fillAndStroke(statusColor, statusColor);
    
    doc.fontSize(11)
       .fillColor(colors.white)
       .font("Helvetica-Bold")
       .text(`${statusIcon} ${statusText}`, 50 + cardPadding + 5, y + 6);

    y += 35;

    // Admin Reply Header
    doc.fontSize(11)
       .fillColor(colors.darkMedium)
       .font("Helvetica-Bold")
       .text("Admin Reply:", 50 + cardPadding, y);
    
    y += 18;

    // Reply Content Box
    const replyText = q.adminReply || "No reply yet. This question is pending response from the admin team.";
    const replyBoxY = y;
    
    const replyBgColor = hasReply ? "#ecfdf5" : "#fef2f2";
    
    doc.fontSize(10)
       .fillColor(colors.dark)
       .font("Helvetica")
       .text(replyText, 50 + cardPadding, y, { 
         width: contentWidth,
         align: "left",
         lineGap: 3
       });

    const replyTextHeight = doc.heightOfString(replyText, { width: contentWidth });
    
    // Draw background for reply
    doc.rect(50 + cardPadding - 5, replyBoxY - 5, contentWidth + 10, replyTextHeight + 15)
       .fillOpacity(0.7)
       .fillAndStroke(replyBgColor, colors.border)
       .fillOpacity(1);
    
    // Redraw reply text
    doc.fontSize(10)
       .fillColor(colors.dark)
       .font("Helvetica")
       .text(replyText, 50 + cardPadding, replyBoxY, { 
         width: contentWidth,
         align: "left",
         lineGap: 3
       });

    y += replyTextHeight + 20;

    // Replied By Info (if answered)
    if (hasReply) {
      doc.fontSize(9)
         .fillColor(colors.gray)
         .font("Helvetica-Oblique")
         .text(`Replied by: ${q.repliedBy?.fullName || "Administrator"} (${q.repliedBy?.email || "admin@farmnex.com"})`, 
               50 + cardPadding, y, { width: contentWidth });
      
      y += 13;

      doc.text(`Replied on: ${q.repliedAt ? new Date(q.repliedAt).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      }) : "Date not available"}`, 
               50 + cardPadding, y, { width: contentWidth });
      
      y += 20;
    } else {
      y += 15;
    }

    // Card Border
    const cardHeight = y - startY;
    doc.roundedRect(50, startY, pageWidth, cardHeight, 8)
       .strokeColor(colors.border)
       .lineWidth(1.5)
       .stroke();

    y += 25; // Space between cards
  };

  // ========== MAIN GENERATION ==========
  
  // Add Header
  addHeader();
  
  // Add Summary Statistics
  drawSummary();

  // Questions Section Header
  doc.fontSize(18)
     .fillColor(colors.primary)
     .font("Helvetica-Bold")
     .text("Questions & Answers", 50, y);
  
  y += 30;

  // Draw each Q&A card
  if (questions && questions.length > 0) {
    questions.forEach((q, index) => {
      drawQACard(q, index);
    });
  } else {
    // No questions message
    doc.fontSize(14)
       .fillColor(colors.gray)
       .font("Helvetica")
       .text("No questions found in the system.", 50, y, { align: "center", width: pageWidth });
  }

  // Add footers to all pages
  addFooter();

  // Finalize PDF
  doc.end();
};