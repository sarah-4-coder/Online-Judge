import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  statement: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' }
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
