import express from 'express';
import {
  saveUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getByRole
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', saveUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/role/:role', getByRole);

export default router;