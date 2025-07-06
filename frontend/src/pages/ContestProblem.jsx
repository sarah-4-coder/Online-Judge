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
        toast.error("Problem not found or access denied");
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
    } catch {
      toast.error("Run failed");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!codeText.trim()) {
        toast.error("Code cannot be empty");
        return;
      }

      setSubmitting(true);
      const res = await API.post("/submissions", {
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
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <Link
        to={`/contests/${contestId}`}
        className="inline-block mb-4 text-sm text-blue-400 hover:underline"
      >
        ← Back to Contest
      </Link>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">{problem.name}</h2>
      <p className="text-sm text-gray-400 mb-4">
        Difficulty: <span className="text-white">{problem.difficulty}</span>
      </p>
      <p className="whitespace-pre-line">{problem.statement}</p>

      {problem.sampleTestCases.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Sample Test Cases</h4>
          {problem.sampleTestCases.map((t, i) => (
            <div key={i} className="bg-white/10 p-4 rounded mb-4 border border-white/10">
              <p className="mb-2">
                <span className="text-blue-400">Input:</span>
                <pre className="bg-black/30 p-2 mt-1 rounded">{t.input}</pre>
              </p>
              <p>
                <span className="text-blue-400">Expected Output:</span>
                <pre className="bg-black/30 p-2 mt-1 rounded">{t.expectedOutput}</pre>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white/5 border border-white/10 p-4 rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Code Editor</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 text-sm px-3 py-1 rounded"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
        </div>
        <Editor
          height="400px"
          language={language}
          theme="vs-dark"
          value={codeText}
          onChange={(val) => setCodeText(val)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
        />

        <div className="mt-4 flex gap-4">
          <button
            onClick={handleRun}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold"
          >
            ▶️ Run Code
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
          >
            {submitting ? "Submitting..." : "🚀 Submit Code"}
          </button>
        </div>

        {runResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold">Run Results</h4>
            {runResults.map((r, i) => (
              <div
                key={i}
                className={`p-4 rounded border ${
                  r.passed
                    ? "border-green-400 bg-green-900/20"
                    : "border-red-400 bg-red-900/20"
                }`}
              >
                <p>
                  <strong>Input:</strong> <code>{r.input}</code>
                </p>
                <p>
                  <strong>Expected:</strong> <code>{r.expectedOutput}</code>
                </p>
                <p>
                  <strong>Actual:</strong> <code>{r.actualOutput}</code>
                </p>
                <p>
                  <strong>Status:</strong> {r.passed ? "✅ Passed" : "❌ Failed"}
                </p>
              </div>
            ))}
          </div>
        )}

        {verdict && (
          <div
            ref={verdictRef}
            className="mt-6 text-lg font-semibold text-center"
          >
            {verdict === "Accepted" ? (
              <span className="text-green-400">✅ {verdict}</span>
            ) : (
              <span className="text-red-400">❌ {verdict}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestProblem;
