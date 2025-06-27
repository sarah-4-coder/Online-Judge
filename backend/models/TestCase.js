import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false } // optional: shown to user if true
});

const TestCase = mongoose.model('TestCase', testCaseSchema);
export default TestCase;
