
import express from "express";
import upload from "../utils/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  askQuestion,
  getAllQuestions,
  replyQuestion,
  editQuestion,
  deleteQuestion,
  generateReport,
} from "../controllers/questionControl.js";

const router = express.Router();

router.post("/ask", authMiddleware, upload.single("image"), askQuestion);
router.get("/", authMiddleware, getAllQuestions);
router.put("/:id/reply", authMiddleware, replyQuestion);
router.put("/:id/edit", authMiddleware, editQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);
router.get("/report", authMiddleware, generateReport);

export default router; 



