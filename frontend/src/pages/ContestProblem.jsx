/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";

const ContestProblem = () => {
  const { contestId, problemCode } = useParams();
  const [problem, setProblem] = useState(null);
  const [codeText, setCodeText] = useState("// Write your code here");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [runResults, setRunResults] = useState([]);
  const verdictRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/contests/${contestId}/problems/${problemCode}`);
        setProblem(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Problem not found or access denied");
      }
    };

    fetchProblem();
  }, [contestId, problemCode]);

  const handleRun = async () => {
    try {
      if (!codeText.trim()) {
        toast.error("Code cannot be empty");
        return;
      }

      setRunResults([]);
      const results = [];

      for (const test of problem.sampleTestCases || []) {
        const res = await API.post("/submissions/run", {
          code: codeText,
          language,
          input: test.input,
        });

        const actual = res.data.output?.trim();
        const expected = test.expectedOutput?.trim();

        results.push({
          input: test.input,
          expectedOutput: expected,
          actualOutput: actual,
          passed: actual === expected,
        });
      }

      setRunResults(results);
    } catch (err) {
      console.error("Run failed:", err);
      toast.error(err.response?.data?.message || "Run failed");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!codeText.trim()) {
        toast.error("Code cannot be empty");
        return;
      }

      setSubmitting(true);

      const res = await API.post("/submissions/contest", {
        code: codeText,
        language,
        contestId,
        problemCode,
      });

      setVerdict(res.data.verdict);
      toast.success("Submitted!");

      setTimeout(() => {
        verdictRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono flex items-center justify-center">Loading problem...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          to={`/contests/${contestId}`}
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Contest
        </Link>

        {/* Problem Statement Section */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-2 text-blue-400">{problem.name}</h2>
          <p className="text-sm text-gray-400 mb-4">
            Difficulty:{" "}
            <span
              className={`font-semibold ${
                problem.difficulty === "Easy"
                  ? "text-green-500"
                  : problem.difficulty === "Medium"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {problem.difficulty}
            </span>
          </p>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
            {problem.statement}
          </div>

          {problem.sampleTestCases.length > 0 && (
            <div className="mt-6 border-t border-gray-800 pt-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-200">Sample Test Cases</h4>
              <div className="space-y-4">
                {problem.sampleTestCases.map((t, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-md border border-gray-700">
                    <p className="mb-2 text-sm">
                      <span className="text-blue-400 font-semibold">Input:</span>
                      <pre className="bg-gray-950 text-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto border border-gray-700">
                        {t.input}
                      </pre>
                    </p>
                    <p className="text-sm">
                      <span className="text-blue-400 font-semibold">Expected Output:</span>
                      <pre className="bg-gray-950 text-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto border border-gray-700">
                        {t.expectedOutput}
                      </pre>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Editor Section */}
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-200">Code Editor</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-gray-200 text-sm px-3 py-1.5 rounded-md border border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
          </div>

          <Editor
            height="450px" 
            language={language}
            theme="vs-dark"
            value={codeText}
            onChange={(val) => setCodeText(val)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: "Fira Code, monospace",
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />

          <div className="mt-4 flex gap-3 justify-end"> 
            <button
              onClick={handleRun}
              className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 px-5 py-2 rounded-md font-semibold transition-colors duration-200 shadow-md"
            >
              ▶️ Run Code
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {submitting ? "Submitting..." : "🚀 Submit Code"}
            </button>
          </div>
        </div>

        {/* Run Results Section */}
        {runResults.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold mb-4 text-gray-200">Run Results</h4>
            <div className="space-y-4">
              {runResults.map((r, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-md border ${
                    r.passed
                      ? "border-green-600 bg-green-900/20"
                      : "border-red-600 bg-red-900/20"
                  } transition-colors duration-200`}
                >
                  <p className="text-sm mb-1">
                    <strong className="text-gray-300">Input:</strong>{" "}
                    <code className="bg-gray-950 text-gray-100 px-2 py-1 rounded text-xs">{r.input}</code>
                  </p>
                  <p className="text-sm mb-1">
                    <strong className="text-gray-300">Expected Output:</strong>{" "}
                    <code className="bg-gray-950 text-gray-100 px-2 py-1 rounded text-xs">{r.expectedOutput}</code>
                  </p>
                  <p className="text-sm mb-2">
                    <strong className="text-gray-300">Actual Output:</strong>{" "}
                    <code className="bg-gray-950 text-gray-100 px-2 py-1 rounded text-xs">{r.actualOutput}</code>
                  </p>
                  <p className="text-base font-semibold">
                    <strong className="text-gray-300">Status:</strong>{" "}
                    {r.passed ? (
                      <span className="text-green-500">✅ Passed</span>
                    ) : (
                      <span className="text-red-500">❌ Failed</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verdict Display */}
        {verdict && (
          <div ref={verdictRef} className="mt-6 text-2xl font-bold text-center p-4 rounded-lg shadow-lg"
            style={{
                backgroundColor: verdict === "Accepted" ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                borderColor: verdict === "Accepted" ? '#22C55E' : '#EF4444',
                borderWidth: '1px'
            }}>
            {verdict === "Accepted" ? (
              <span className="text-green-500">✅ {verdict}</span>
            ) : (
              <span className="text-red-500">❌ {verdict}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestProblem;
