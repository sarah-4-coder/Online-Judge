import mongoose from 'mongoose';

const joinedContestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  joinedAt: { type: Date, default: Date.now }
});

joinedContestSchema.index({ userId: 1, contestId: 1 }, { unique: true });

const JoinedContest = mongoose.model("JoinedContest", joinedContestSchema);
export default JoinedContest;
