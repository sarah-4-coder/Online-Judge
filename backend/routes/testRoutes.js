import express from 'express';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Logged-in users can access this
router.get('/user', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, your ID is ${req.user.id}` });
});

// ✅ Only admin users can access this
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: `Welcome Admin: ${req.user.id}` });
});

export default router;
