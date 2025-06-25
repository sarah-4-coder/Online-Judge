import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Connect to DB
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
