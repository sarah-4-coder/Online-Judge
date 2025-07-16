import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', default: null, required: false }, 
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', default: null },
  contestProblemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestProblem', default: null },
  problemCode: { type: String, default: null },
  language: { type: String, required: true },
  code: { type: String, required: true },
  verdict: { type: String, default: "Pending" },
},{ timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;