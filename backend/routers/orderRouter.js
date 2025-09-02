import express from 'express';
import { createOrder, savePayment, saveShipping } from '../controllers/orderController.js';

const router = express.Router();
router.post("/", createOrder);
router.put('/shipping/:id', saveShipping); // Changed from '/order/:id/shipping'
router.put('/payment/:id', savePayment);

export default router;