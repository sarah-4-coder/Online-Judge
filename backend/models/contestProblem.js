import mongoose from 'mongoose';

const contestProblemSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String, required: true },
  statement: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  sampleTestCases: [
    {
      input: String,
      expectedOutput: String
    }
  ],
  hiddenTestCases: [
    {
      input: String,
      expectedOutput: String
    }
  ]
}, { timestamps: true });

export default mongoose.model('ContestProblem', contestProblemSchema);
