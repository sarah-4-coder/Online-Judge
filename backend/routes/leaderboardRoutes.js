import express from "express";
import { getContestLeaderboard, getLeaderboard } from "../controllers/leaderboardController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", getLeaderboard);
router.get("/contest/:contestId", verifyToken, getContestLeaderboard);

export default router;
