import express from 'express';
import { 
  getAllFarmSupplies, 
  getFarmSupplyById, 
  createFarmSupply, 
  updateFarmSupply, 
  deleteFarmSupply,
  getLowStockSupplies,
  getSuppliesByCategory
} from '../controllers/farmSupplyController.js';

const router = express.Router();

// GET routes
router.get("/", getAllFarmSupplies);
router.get("/low-stock", getLowStockSupplies);
router.get("/category/:category", getSuppliesByCategory);
router.get("/:id", getFarmSupplyById);

// POST routes
router.post("/", createFarmSupply);

// PUT routes
router.put("/:id", updateFarmSupply);

// DELETE routes
router.delete("/:id", deleteFarmSupply);

export default router;
