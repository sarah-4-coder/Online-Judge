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
      return res.status(400).json({ message: "Missing topic or difficulty" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert problem setter for a coding platform like LeetCode or Codeforces.

🎯 Task:
Generate a well-structured programming problem for the topic: **${topic}**, with difficulty: **${difficulty}**.

⚠️ Strict Instructions:
- No markdown, no backticks, no code fences.
- Use plain JSON format only.
- The "statement" must include input and output format clearly (e.g., first line contains n, second line contains n space-separated integers).
- Inputs must use space-separated format (NOT JSON arrays like [1,2,3]).
- Do NOT write explanations, ONLY the structured problem.

🎯 Output JSON Format (no extra characters):

{
  "name": "Descriptive Title",
  "code": "unique_code_snake_case",
  "difficulty": "Easy|Medium|Hard",
  "statement": "Full problem description including input/output format and constraints.",
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

💡 Example Input style:
Use this:
"input": "3\\n1 2 3"
Not this:
"input": "[1,2,3]"

Respond ONLY with valid JSON — no markdown, no explanation.
`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text();

    // Fix escaped characters in the raw Gemini response if needed
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({
        message: "Could not extract valid JSON from Gemini response.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Optional validation
    const valid =
      parsed.name &&
      parsed.code &&
      parsed.difficulty &&
      parsed.statement &&
      Array.isArray(parsed.sampleTestCases) &&
      parsed.sampleTestCases.length > 0;

    if (!valid) {
      return res
        .status(400)
        .json({ message: "Invalid problem structure from AI." });
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("AI Problem Generator Error:", err.message);
    res.status(500).json({ message: "Failed to generate problem using AI" });
  }
};

export const generateBoilerplate = async (req, res) => {
  try {
    const { statement, language } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert coding mentor.

Generate pseudocode or the step to solve the problem in ${language} based ONLY on the following problem:
---
${statement}
---
Rules:
- Return ONLY pure pseudocode or the step to solve the problem using code-style comments (e.g. // line).
- Do NOT include any actual code, markdown, explanations, or blank lines.
- Each step must be in a single-line comment format.
- The output should be directly copy-pasteable as commented pseudocode.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ boilerplate: text });
  } catch (err) {
    console.error("Boilerplate Error:", err.message);
    res.status(500).json({ message: "Failed to generate boilerplate" });
  }
};

export const simplifyProblem = async (req, res) => {
  try {
    const { statement } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Simplify this coding problem for beginners. Keep it short, clear, and highlight the core logic and input-output format.

---
${statement}
---

Only return simplified plain text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ simplified: text });
  } catch (err) {
    console.error("Simplify Error:", err.message);
    res.status(500).json({ message: "Failed to simplify problem" });
  }
};
