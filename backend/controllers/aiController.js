import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const explainCode = async (req, res) => {
  const { code } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`Explain this code:\n\n${code}`);
    const response = await result.response;
    const explanation = response.text();

    res.json({ explanation });
  } catch (error) {
    console.error("Gemini SDK error:", error.message);
    res
      .status(500)
      .json({ message: "AI explanation failed", error: error.message });
  }
};

export const debugCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Code required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a code debugging assistant. Help identify bugs or logical errors in the following code and give suggestions if possible.

Code:
\`\`\`
${code}
\`\`\`

Output your suggestions in bullet points or paragraph form.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ debug: text });
  } catch (err) {
    console.error("Gemini Debug API error:", err.message);
    res.status(500).json({ message: "Failed to generate debug info" });
  }
};

export const getHint = async (req, res) => {
  try {
    const { problemStatement, difficulty } = req.body;

    if (!problemStatement || !difficulty) {
      return res.status(400).json({ message: "Missing input" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert coding tutor. Give a clear and helpful HINT for this problem WITHOUT revealing the solution.

Difficulty: ${difficulty}
Problem Statement:
${problemStatement}

Only return the hint in 2-3 lines.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ hint: text.trim() });
  } catch (err) {
    console.error("Hint generation error:", err.message);
    res.status(500).json({ message: "Failed to generate hint" });
  }
};

export const generateProblem = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({ message: "Missing input" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert problem setter for a coding platform.

Generate a coding problem and respond with ONLY valid JSON in the following format. 

🧠 Your job is to make the problem clear, structured, and executable — use proper "Input" format sections. No markdown or code fences.

Rules:
- Input must always be clear and compatible with C++, JS, Python (e.g., first line has n, second line has n elements).
- Avoid formats like "[1,2,3]" — instead use space-separated integers, lengths, etc.
- You must always include the input format in the "statement".
- Avoid code fences like \`\`\`.

Return JSON like this:

{
  "name": "Rotate Array",
  "code": "rotate_array",
  "difficulty": "Easy",
  "statement": "You are given an array of N integers and an integer K. Rotate the array to the right by K steps.\n\nInput:\nFirst line contains two integers N and K.\nSecond line contains N space-separated integers.\n\nOutput:\nSingle line with N space-separated integers after rotation.",
  "sampleTestCases": [
    {
      "input": "5 2\\n1 2 3 4 5",
      "expectedOutput": "4 5 1 2 3"
    },
    {
      "input": "4 1\\n10 20 30 40",
      "expectedOutput": "40 10 20 30"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "6 3\\n1 2 3 4 5 6",
      "expectedOutput": "4 5 6 1 2 3"
    }
  ]
}
Only respond with plain JSON.
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // ✅ Extract JSON block using regex
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res
        .status(500)
        .json({ message: "Could not extract valid JSON from AI response" });
    }

    const json = JSON.parse(match[0]);
    res.status(200).json(json);
  } catch (err) {
    console.error("AI Problem Generator Error:", err.message);
    res.status(500).json({ message: "Failed to generate problem using AI" });
  }
};
