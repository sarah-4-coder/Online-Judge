import Contest from "../models/contest.js";
import ContestProblem from "../models/contestProblem.js";
import JoinedContest from "../models/joinedContest.js";

export const getContestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    // Check if user has joined
    if (!contest.participants.includes(userId)) {
      return res.status(403).json({ message: "You have not joined this contest." });
    }

    const problems = await ContestProblem.find({ contestId: id }).select("name code");

    res.status(200).json({
      ...contest.toObject(),
      problems,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching contest", error: err.message });
  }
};


// Create Contest with Problems
export const createContest = async (req, res) => {
  try {
    const { name, description ,startTime, endTime, problems } = req.body;

    if (!name || !startTime || !endTime || !Array.isArray(problems)) {
      return res.status(400).json({ message: "Invalid contest data" });
    }

    // Create contest
    const contest = await Contest.create({
      name,
      description,
      startTime,
      endTime,
    });

    // Save contest problems
    const problemDocs = await Promise.all(
      problems.map(async (p) => {
        return await ContestProblem.create({
          ...p,
          contestId: contest._id,
        });
      })
    );

    // Update contest with problem IDs
    contest.problems = problemDocs.map((p) => p._id);
    await contest.save();

    res.status(201).json({ message: "Contest created", contest });
  } catch (err) {
    console.error("Contest creation error:", err.message);
    res.status(500).json({ message: "Server error while creating contest" });
  }
};


export const addProblemToContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const problem = await ContestProblem.create({
      ...req.body,
      contestId: id,
    });

    res.status(201).json({ message: "Problem added", problem });
  } catch (err) {
    res.status(500).json({ message: "Failed to add problem", error: err.message });
  }
};



export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 });
    res.status(200).json(contests);
  } catch (err) {
    res.status(500).json({ message: "Failed to load contests" });
  }
};


export const joinContest = async (req, res) => {
  try {
    const { contestId } = req.body;
    const userId = req.user.id;

    const exists = await JoinedContest.findOne({ userId, contestId });
    if (exists) return res.status(200).json({ message: "Already joined" });

    await JoinedContest.create({ userId, contestId });

    // ✅ Add user to contest.participants array
    await Contest.findByIdAndUpdate(contestId, {
      $addToSet: { participants: userId }
    });

    res.status(201).json({ message: "Successfully joined contest" });
  } catch (err) {
    res.status(500).json({ message: "Failed to join contest", error: err.message });
  }
};





export const getContestProblem = async (req, res) => {
  try {
    const { contestId, problemCode } = req.params;
    const userId = req.user.id;

    const contest = await Contest.findById(contestId);
    if (!contest || !contest.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied to contest" });
    }

    const problem = await ContestProblem.findOne({
      contestId,
      code: problemCode,
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ message: "Error loading contest problem" });
  }
};
