import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import TestCase from "../models/TestCase.js";
import ContestProblem from "../models/contestProblem.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BACKEND_URL;

export const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await Submission.find({ userId })
      .populate("problemId", "name code")
      .populate("contestProblemId", "name code")
      .sort({ createdAt: -1 });

    const response = submissions.map((s) => ({
      _id: s._id,
      problem: s.problemId
        ? {
            name: s.problemId.name,
            id: s.problemId._id,
            code: s.problemId.code,
          }
        : s.contestProblemId
        ? {
            name: s.contestProblemId.name,
            id: s.contestProblemId._id,
            code: s.contestProblemId.code,
          }
        : null,

      verdict: s.verdict,
      language: s.language,
      createdAt: s.createdAt,

      problemCode:
        s.problemCode ||
        (s.problemId
          ? s.problemId.code
          : s.contestProblemId
          ? s.contestProblemId.code
          : null),
      contestId: s.contestId,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching submissions:", err.message);
    res
      .status(500)
      .json({ message: "Error fetching submissions", error: err.message });
  }
};

export const runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;
    if (!code || !language || !input) {
      return res
        .status(400)
        .json({ message: "Code, language, and input are required." });
    }

    const result = await axios.post(`${BASE_URL}/run`, {
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
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const testCases = await TestCase.find({
      problemId: problem._id,
      isSample: false,
    });

    let verdict = "Accepted";

    for (const test of testCases) {
      const result = await axios.post(`${BASE_URL}/run`, {
        language,
        code,
        input: test.input,
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
      verdict,
    });

    await submission.save();

    res.status(200).json({ verdict });
  } catch (err) {
    console.error("SubmitCode (regular) error:", err.message);
    res
      .status(500)
      .json({ message: "Error during code submission", error: err.message });
  }
};

export const submitContestCode = async (req, res) => {
  try {
    const { code, language, problemCode, contestId } = req.body;
    const userId = req.user.id;

    if (!contestId || !problemCode) {
      return res.status(400).json({
        message:
          "Contest ID and Problem Code are required for contest submission.",
      });
    }

    const contestProblem = await ContestProblem.findOne({
      code: problemCode,
      contestId,
    });
    if (!contestProblem) {
      console.error(
        `Contest problem not found for code: ${problemCode}, contestId: ${contestId}`
      );
      return res.status(404).json({ message: "Contest problem not found" });
    }

    const testCases = contestProblem.hiddenTestCases; //
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      console.error(
        `No hidden test cases found for contest problem: ${contestProblem.name}`
      );
      return res.status(400).json({
        message: "No hidden test cases configured for this contest problem.",
      });
    }

    let verdict = "Accepted";

    for (const test of testCases) {
      const result = await axios.post(`${BASE_URL}/run`, {
        language,
        code,
        input: test.input,
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
      contestId,
      contestProblemId: contestProblem._id,
      problemCode: problemCode,
      language,
      code,
      verdict,
    });

    await submission.save();

    res.status(200).json({ verdict });
  } catch (err) {
    console.error("SubmitContestCode error:", err.message);
    if (err.response) {
      console.error("Compiler Backend Response Error:", err.response.data);
    }
    res.status(500).json({
      message: "Error during contest code submission",
      error: err.message,
    });
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
      contestId: null,
    }).sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching submissions for problem",
      error: err.message,
    });
  }
};
