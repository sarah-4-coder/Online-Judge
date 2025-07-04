import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';
import axios from 'axios';


export const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'name') 
      .sort({ createdAt: -1 });

    const response = submissions.map((s) => ({
      _id: s._id,
      problem: {
        name: s.problemId.name,
        id: s.problemId._id,  
      },
      verdict: s.verdict,
      language: s.language,
      createdAt: s.createdAt,
    }));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching submissions', error: err.message });
  }
};


export const runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;
    if (!code || !language || !input) {
      return res.status(400).json({ message: "Code, language, and input are required." });
    }

    const result = await axios.post("http://localhost:5000/run", {
      language,
      code,
      input,
    });

    const output = result.data.output?.trim();

    res.status(200).json({
      verdict: "Run Successful",
      output,
    });

  } catch (err) {
    console.error("Run error:", err);
    res.status(500).json({
      message: "Run failed",
      error: err.message,
    });
  }
};


export const submitCode = async (req, res) => {
  try {
    const { code, language, problemCode } = req.body;
    const userId = req.user.id;

    const problem = await Problem.findOne({ code: problemCode });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const testCases = await TestCase.find({ problemId: problem._id, isSample: false });

    let verdict = "Accepted";

    for (const test of testCases) {
      const result = await axios.post("http://localhost:5000/run", {
        language,
        code,
        input: test.input
      });

      const output = result.data.output?.trim();
      const expected = test.expectedOutput?.trim();

      if (output !== expected) {
        verdict = "Wrong Answer";
        break;
      }
    }

    const submission = new Submission({
      userId,
      problemId: problem._id,
      language,
      code,
      verdict
    });

    await submission.save();

    res.status(200).json({ verdict });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during code submission', error: err.message });
  }
};

export const getMySubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problemCode } = req.params;

    const problem = await Problem.findOne({ code: problemCode });
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const submissions = await Submission.find({
      userId,
      problemId: problem._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions", error: err.message });
  }
};

