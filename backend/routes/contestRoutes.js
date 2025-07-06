import express from "express";
import { addProblemToContest, createContest, getAllContests, getContestDetails, getContestProblem, joinContest } from "../controllers/contestController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import JoinedContest from "../models/joinedContest.js";

const router = express.Router();

router.get("/", verifyToken,getAllContests);
router.post("/", verifyToken,verifyAdmin, createContest);
router.post("/:id/problems", verifyToken, verifyAdmin, addProblemToContest);

router.post("/join", verifyToken, joinContest);
router.get("/:id", verifyToken, getContestDetails);
router.get("/:contestId/problems/:problemCode", verifyToken, getContestProblem);

router.get("/joined", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const joins = await JoinedContest.find({ userId }).select("contestId");
    const joinedIds = joins.map((j) => j.contestId.toString());
    res.json(joinedIds); 
  } catch (err) {
    console.error("Error fetching joined contests:", err.message);
    res.status(500).json({ message: "Failed to fetch joined contests" });
  }
});



export default router;
