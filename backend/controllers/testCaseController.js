import TestCase from '../models/TestCase.js';

export const addTestCase = async (req, res) => {
  try {
    const { problemId, input, expectedOutput, isSample } = req.body;

    const testCase = new TestCase({
      problemId,
      input,
      expectedOutput,
      isSample
    });

    await testCase.save();
    res.status(201).json({ message: 'Test case added successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Optional: Get all test cases for a problem (admin use only)
export const getTestCasesForProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const testCases = await TestCase.find({ problemId });
    res.status(200).json(testCases);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
