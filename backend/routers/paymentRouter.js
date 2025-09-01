import express from 'express';
import { addPaymentMethod, deletePaymentMethod, getUserPaymentMethods, updatePaymentMethod } from '../controllers/paymentController.js';


const router = express.Router();

router.post('/',addPaymentMethod);
router.get('/',getUserPaymentMethods);  
router.delete('/:id',deletePaymentMethod);  
router.put('/:id',updatePaymentMethod);  



export default router;

