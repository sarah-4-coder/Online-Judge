import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
}, { timestamps: true });

export default mongoose.model('Contest', contestSchema);
