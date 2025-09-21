import express from 'express';
import { 
  createOrder, 
  savePayment, 
  saveShipping, 
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getMyOrders,
  deleteOrder
} from '../controllers/orderController.js';
import { generateReceiptPDF } from '../controllers/receiptController.js';

const router = express.Router();

// Order CRUD operations
router.post("/", createOrder);
router.get("/", getAllOrders); // Admin only - get all orders
router.get("/my-orders", getMyOrders); // Get current user's orders
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);

// Order updates
router.put('/shipping/:id', saveShipping);
router.put('/payment/:id', savePayment);
router.put('/status/:id', updateOrderStatus);

// Receipt generation
router.get('/receipt/:orderId/pdf', generateReceiptPDF);

export default router;