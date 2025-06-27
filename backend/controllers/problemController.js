import Problem from '../models/Problem.js';

import TestCase from '../models/TestCase.js';

export const getProblemByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const problem = await Problem.findOne({ code });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Fetch sample test cases only
    const sampleCases = await TestCase.find({
      problemId: problem._id,
      isSample: true
    });

    res.status(200).json({
      ...problem.toObject(),
      sampleTestCases: sampleCases
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


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
    const { name, code, statement, difficulty, sampleTestCases, hiddenTestCases } = req.body;

    const problem = await Problem.create({ name, code, statement, difficulty });

    if (sampleTestCases && sampleTestCases.length > 0) {
      for (const test of sampleTestCases) {
        await TestCase.create({ ...test, isSample: true, problemId: problem._id });
      }
    }

    if (hiddenTestCases && hiddenTestCases.length > 0) {
      for (const test of hiddenTestCases) {
        await TestCase.create({ ...test, isSample: false, problemId: problem._id });
      }
    }

    res.status(201).json({ message: "Problem added" });
  } catch (err) {
    res.status(500).json({ message: "Error adding problem", error: err.message });
  }
};

