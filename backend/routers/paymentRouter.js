import express from 'express';
import { addPaymentMethod, deletePaymentMethod, getUserPaymentMethods, updatePaymentMethod, setDefaultPaymentMethod } from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All payment routes require authentication
router.post('/', authMiddleware, addPaymentMethod);
router.get('/', authMiddleware, getUserPaymentMethods);  
router.delete('/:id', authMiddleware, deletePaymentMethod);  
router.put('/:id', authMiddleware, updatePaymentMethod);
router.patch('/:id/default', authMiddleware, setDefaultPaymentMethod);



export default router;

