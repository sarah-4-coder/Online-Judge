import express from 'express';
import { submitCode, runCode, getMySubmissionsForProblem, submitContestCode } from '../controllers/submissionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getMySubmissions } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/regular', verifyToken, submitCode); 
router.post('/contest', verifyToken, submitContestCode);
router.post('/run', verifyToken, runCode); 
router.get('/mine', verifyToken, getMySubmissions);
router.get("/mine/:problemCode", verifyToken, getMySubmissionsForProblem);



export default router;
