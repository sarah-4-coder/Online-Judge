import express from 'express';
import { submitCode, runCode, getMySubmissionsForProblem } from '../controllers/submissionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getMySubmissions } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', verifyToken, submitCode);
router.post('/run', verifyToken, runCode); 
router.get('/mine', verifyToken, getMySubmissions);
router.get("/mine/:problemCode", verifyToken, getMySubmissionsForProblem);



export default router;
