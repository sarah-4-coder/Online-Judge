import express from 'express';
import { addTestCase, getTestCasesForProblem } from '../controllers/testCaseController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, verifyAdmin, addTestCase);
router.get('/:problemId', verifyToken, verifyAdmin, getTestCasesForProblem);

export default router;
