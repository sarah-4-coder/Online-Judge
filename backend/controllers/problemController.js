import Problem from '../models/Problem.js';

// GET all problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST a new problem (admin only)
export const createProblem = async (req, res) => {
  try {
    const { name, code, statement, difficulty } = req.body;

    const existing = await Problem.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Problem code already exists' });

    const newProblem = new Problem({ name, code, statement, difficulty });
    await newProblem.save();

    res.status(201).json({ message: 'Problem created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
