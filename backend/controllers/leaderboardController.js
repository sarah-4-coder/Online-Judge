import Submission from "../models/Submission.js";
import Contest from "../models/contest.js";
import ContestProblem from "../models/contestProblem.js";
import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { verdict: "Accepted", problemId: { $ne: null } } },
      {
        $group: {
          _id: { userId: "$userId", problemId: "$problemId" },
          firstAcceptedAt: { $min: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$_id.userId",
          totalAccepted: { $sum: 1 },
        },
      },
      { $sort: { totalAccepted: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          totalAccepted: 1,
        },
      },
    ]);

    res.status(200).json(leaderboard);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load leaderboard", error: err.message });
  }
};

export const getContestLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const submissions = await Submission.find({ contestId });

    const contestProblems = await ContestProblem.find({ contestId }).select(
      "_id name code"
    );
    const problemMap = new Map(
      contestProblems.map((p) => [
        p._id.toString(),
        { name: p.name, code: p.code },
      ])
    );

    const userScores = new Map();

    for (const sub of submissions) {
      const userId = sub.userId.toString();
      const contestProblemId = sub.contestProblemId.toString();
      const createdAt = new Date(sub.createdAt);

      if (!userScores.has(userId)) {
        userScores.set(userId, {
          problems: new Map(),
          totalPenalty: 0,
          problemsSolvedCount: 0,
        });
      }

      const userData = userScores.get(userId);

      if (!userData.problems.has(contestProblemId)) {
        userData.problems.set(contestProblemId, {
          acceptedTime: null,
          wrongAttempts: 0,
        });
      }

      const problemData = userData.problems.get(contestProblemId);

      if (problemData.acceptedTime === null) {
        if (sub.verdict === "Accepted") {
          problemData.acceptedTime = createdAt;
          userData.problemsSolvedCount += 1;
        } else if (sub.verdict === "Wrong Answer") {
          problemData.wrongAttempts += 1;
        }
      }
    }

    const leaderboard = [];

    for (const [userId, userData] of userScores.entries()) {
      let currentTotalPenalty = 0;

      for (const [problemId, problemStats] of userData.problems.entries()) {
        if (problemStats.acceptedTime !== null) {
          const timePenalty = Math.floor(
            problemStats.acceptedTime.getTime() / (1000 * 60)
          );
          const wrongAttemptPenalty = problemStats.wrongAttempts * 20;

          currentTotalPenalty += timePenalty + wrongAttemptPenalty;
        }
      }

      leaderboard.push({
        userId,
        problemsSolved: userData.problemsSolvedCount,
        totalPenalty: currentTotalPenalty,
      });
    }

    leaderboard.sort((a, b) => {
      if (b.problemsSolved !== a.problemsSolved) {
        return b.problemsSolved - a.problemsSolved;
      }
      return a.totalPenalty - b.totalPenalty;
    });

    const users = await User.find({
      _id: { $in: leaderboard.map((entry) => entry.userId) },
    }).select("fullName email");
    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        { fullName: u.fullName, email: u.email },
      ])
    );

    const finalLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      fullName: userMap.get(entry.userId)?.fullName || "Unknown User",
      email: userMap.get(entry.userId)?.email || "N/A",
      problemsSolved: entry.problemsSolved,
      totalPenalty: entry.totalPenalty,
    }));

    res.status(200).json(finalLeaderboard);
  } catch (err) {
    console.error("Error generating contest leaderboard:", err);
    res
      .status(500)
      .json({
        message: "Failed to load contest leaderboard",
        error: err.message,
      });
  }
};
