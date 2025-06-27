import express from 'express';
import { getAllProblems, createProblem, getProblemByCode } from '../controllers/problemController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllProblems);
router.post('/', verifyToken, verifyAdmin, createProblem);
router.get('/:code', verifyToken, getProblemByCode);
router.post("/", verifyToken, verifyAdmin, createProblem);



export default router;
