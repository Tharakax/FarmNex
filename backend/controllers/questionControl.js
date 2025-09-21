// controllers/questionController.js - Fixed version
import Question from "../models/questionModel.js";
import User from "../models/usermodel.js";
import { generatePDF, generateExcel } from "../utils/reportGenerator.js";

// Ask Question (with optional image)
export const askQuestion = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle image path - fix the path structure
    const imagePath = req.file ? `imageupload/${req.file.filename}` : null;

    const question = new Question({
      title: title.trim(),
      content: content.trim(),
      image: imagePath,
      author: user._id,
      authorName: user.fullName,
      status: 'open' // Make sure status is set
    });

    await question.save();
    
    console.log('Question saved successfully:', question); // Debug log
    
    return res.status(201).json({ 
      message: "Question created successfully", 
      question 
    });
  } catch (err) {
    console.error('Error in askQuestion:', err); // Better error logging
    return res.status(500).json({ 
      message: "Failed to create question",
      error: err.message 
    });
  }
};

// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    let questions;

    if (req.user.role === "Admin") {
      // Admins see all questions
      questions = await Question.find()
        .populate("author", "fullName email role")
        .sort({ createdAt: -1 });
    } else {
      // Regular users see only their own questions
      questions = await Question.find({ author: req.user.id })
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(questions || []);
  } catch (err) {
    console.error('Error in getAllQuestions:', err);
    return res.status(500).json({ 
      message: "Failed to fetch questions",
      error: err.message 
    });
  }
};

// Admin reply question
export const replyQuestion = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.adminReply) {
      return res.status(400).json({ message: "Question already has a reply" });
    }

    question.adminReply = reply.trim();
    question.repliedBy = req.user.id;
    question.repliedAt = new Date();
    question.status = "answered";

    await question.save();
    return res.status(200).json({ message: "Reply added", question });
  } catch (err) {
    console.error('Error in replyQuestion:', err);
    return res.status(500).json({ 
      message: "Failed to reply",
      error: err.message 
    });
  }
};

// Edit question (cannot edit after reply)
export const editQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user owns the question (for non-admin users)
    if (req.user.role !== "Admin" && question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent editing if already answered (unless admin)
    if (req.user.role !== "Admin" && question.adminReply) {
      return res.status(400).json({ message: "Cannot edit question after admin reply" });
    }

    question.title = title.trim();
    question.content = content.trim();

    await question.save();
    return res.status(200).json({ message: "Question updated", question });
  } catch (err) {
    console.error('Error in editQuestion:', err);
    return res.status(500).json({ 
      message: "Failed to update question",
      error: err.message 
    });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user owns the question (for non-admin users)
    if (req.user.role !== "Admin" && question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent deletion if already answered (unless admin)
    if (req.user.role !== "Admin" && question.adminReply) {
      return res.status(400).json({ message: "Cannot delete question after admin reply" });
    }

    await Question.findByIdAndDelete(id);
    return res.status(200).json({ message: "Question deleted" });
  } catch (err) {
    console.error('Error in deleteQuestion:', err);
    return res.status(500).json({ 
      message: "Failed to delete question",
      error: err.message 
    });
  }
};

// Generate PDF/Excel report
export const generateReport = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const questions = await Question.find({ status: "answered" })
      .populate("author", "fullName email")
      .populate("repliedBy", "fullName email");

    const format = req.query.format || "pdf";
    
    if (format === "excel") {
      await generateExcel(questions, res);
    } else {
      await generatePDF(questions, res);
    }
  } catch (err) {
    console.error('Error in generateReport:', err);
    return res.status(500).json({ 
      message: "Failed to generate report",
      error: err.message 
    });
  }
};