import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './database/db.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import testCaseRoutes from './routes/testCaseRoutes.js';
import cookieParser from 'cookie-parser';
import submissionRoutes from './routes/submissionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contestRoutes from './routes/contestRoutes.js';


dotenv.config();
const app = express();
app.use(cors({
  origin: 'https://www.codeverdict.online',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT;


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/contests", contestRoutes);


// Connect to DB
connectDB();

app.get('/', (req, res) => {
  res.send('Welcome to the Online Judge API');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
