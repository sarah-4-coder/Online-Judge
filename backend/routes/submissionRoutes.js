import express from 'express';
import { submitCode } from '../controllers/submissionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getMySubmissions } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', verifyToken, submitCode);
router.get('/mine', verifyToken, getMySubmissions);


export default router;
