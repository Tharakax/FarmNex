import express from 'express';
import { createOrder, saveShipping } from '../controllers/orderController.js';


const router = express.Router();
router.post("/:id/shipping-info", saveShipping);
router.post("/", createOrder);

export default router;