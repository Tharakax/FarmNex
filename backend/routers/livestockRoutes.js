import express from "express";
import {
  createLivestock,
  getAllLivestock,
  getLivestockById,
  updateLivestock,
  deleteLivestock,
  generateLivestockReport,
} from "../controllers/livestockController.js";


const router = express.Router();

// Routes
router.post("/add", createLivestock);
router.get("/get", getAllLivestock);
router.get("/get/:id", getLivestockById);
router.put("/update/:id", updateLivestock);
router.delete("/delete/:id", deleteLivestock);

router.get("/report/pdf", generateLivestockReport);

export default router;
