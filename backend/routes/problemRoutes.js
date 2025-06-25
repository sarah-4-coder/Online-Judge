import express from 'express';
import { getAllProblems, createProblem } from '../controllers/problemController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllProblems);
router.post('/', verifyToken, verifyAdmin, createProblem);

export default router;
