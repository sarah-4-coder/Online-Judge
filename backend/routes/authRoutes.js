import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});
router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});


export default router;
