import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  verdict: { type: String, default: "Pending" },
  submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
