/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Editor from "@monaco-editor/react";

const languageOptions = [
  { name: "C++", value: "cpp" },
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
];

const ProblemDetail = () => {
  const { code } = useParams();
  const [problem, setProblem] = useState(null);
  const [codeText, setCodeText] = useState("// write your code here");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/problems/${code}`);
        setProblem(res.data);
      } catch (err) {
        alert("Problem not found.");
      }
    };
    fetchProblem();
  }, [code]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setVerdict(null);
      const res = await API.post("/submissions", {
        code: codeText,
        language,
        problemCode: code,
      });
      setVerdict(res.data.verdict || "Submission Successful");
    } catch (err) {
      setVerdict("Error: " + (err.response?.data?.message || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return <div className="p-6">Loading problem...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">{problem.name}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Difficulty: <span className="font-semibold">{problem.difficulty}</span>
        </p>
        <p className="whitespace-pre-line">{problem.statement}</p>

        {problem.sampleTestCases.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Sample Test Case(s)</h4>
            {problem.sampleTestCases.map((t, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded mb-3 text-sm">
                <p><strong>Input:</strong><br /><code>{t.input}</code></p>
                <p className="mt-2"><strong>Expected Output:</strong><br /><code>{t.expectedOutput}</code></p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Code Editor</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border p-1 rounded"
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.name}</option>
            ))}
          </select>
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit Code"}
        </button>

        {verdict && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <strong>Verdict:</strong> {verdict}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;
