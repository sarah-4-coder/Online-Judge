import Submission from '../models/Submission.js';

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { verdict: "Accepted" } },
      { $group: { _id: "$userId", totalAccepted: { $sum: 1 } } },
      { $sort: { totalAccepted: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          totalAccepted: 1
        }
      }
    ]);

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Failed to load leaderboard", error: err.message });
  }
};
