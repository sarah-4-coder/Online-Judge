import express from "express";
import {
  addProblemToContest,
  createContest,
  getAllContests,
  getContestDetails,
  getContestProblem,
  getContestSubmissions,
  joinContest,
} from "../controllers/contestController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import JoinedContest from "../models/joinedContest.js";

const router = express.Router();

router.get("/joined", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const joins = await JoinedContest.find({ userId }).select("contestId");
    const joinedIds = joins.map((j) => j.contestId.toString());
    res.json(joinedIds);
  } catch (err) {
    console.error("Critical error in /joined route handler:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch joined contests", error: err.message });
  }
});
router.get("/", verifyToken, getAllContests);
router.post("/", verifyToken, verifyAdmin, createContest);
router.post("/:id/problems", verifyToken, verifyAdmin, addProblemToContest);
router.get("/:id/submissions", verifyToken, getContestSubmissions);
router.post("/join", verifyToken, joinContest);
router.get("/:id", verifyToken, getContestDetails);
router.get("/:contestId/problems/:problemCode", verifyToken, getContestProblem);

export default router;
