import express from "express";
import { explainCode , debugCode , getHint } from "../controllers/aiController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { generateProblem } from "../controllers/aiController.js";
import { generateBoilerplate } from "../controllers/aiController.js";
import { simplifyProblem } from "../controllers/aiController.js";

const router = express.Router();

router.post("/explain", explainCode);
router.post("/debug",debugCode)
router.post("/hint", verifyToken, getHint);
router.post("/generate-problem", verifyToken, verifyAdmin, generateProblem);

router.post("/boilerplate", generateBoilerplate);
router.post("/simplify", simplifyProblem);
export default router;
