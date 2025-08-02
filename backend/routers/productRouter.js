import express from 'express';
import { getAllProducts, saveProduct, getProductById, deleteProduct, editProduct} from '../controllers/productController.js';

const router = express.Router();

router.post("/", saveProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);
router.put("/:id", editProduct);



export default router;