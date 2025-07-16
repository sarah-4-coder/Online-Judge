/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

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
  const [output, setOutput] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [runResults, setRunResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [viewCode, setViewCode] = useState("");
  const [viewLang, setViewLang] = useState("cpp");
  const [explanation, setExplanation] = useState("");
  const [action, setAction] = useState("");
  const [debug, setDebug] = useState("");
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [boilerplate, setBoilerplate] = useState("");
  const [simplified, setSimplified] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [simplifyModal, setSimplifyModal] = useState(false);

  const [activeTab, setActiveTab] = useState("runResults");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/problems/${code}`);
        setProblem(res.data);
      } catch {
        toast.error("Problem not found");
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await API.get(`/submissions/mine/${code}`);
        setSubmissions(res.data);
      } catch {
        toast.error("Error loading submissions");
      }
    };

    fetchProblem();
    fetchSubmissions();
  }, [code]);

  const handleHint = async () => {
    try {
      setHintLoading(true);
      setHint("");
      const res = await API.post("/ai/hint", {
        problemStatement: problem.statement,
        difficulty: problem.difficulty,
      });
      setHint(res.data.hint);
    } catch (err) {
      toast.error("Failed to get hint");
    } finally {
      setHintLoading(false);
    }
  };

  const handleBoilerplate = async () => {
    try {
      setAction("boilerplate");
      const res = await API.post("/ai/boilerplate", {
        statement: problem.statement,
        language: language,
      });
      setCodeText(res.data.boilerplate);
      toast.success("Pseudocode inserted!");
    } catch {
      toast.error("Failed to generate pseudocode");
    } finally {
      setAction("");
    }
  };

  const handleSimplify = async () => {
    try {
      setAction("simplify");
      const res = await API.post("/ai/simplify", {
        statement: problem.statement,
      });
      setSimplified(res.data.simplified);
      setSimplifyModal(true);
    } catch {
      toast.error("Failed to simplify problem");
    } finally {
      setAction("");
    }
  };

  const handleRun = async () => {
    try {
      setAction("run");
      setRunResults([]);
      setVerdict(null);
      setExplanation("");
      setOutput(null);
      setDebug("");
      setActiveTab("runResults");

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
    } finally {
      setAction("");
    }
  };

  const handleCustomRun = async () => {
    try {
      setAction("customRun");
      setOutput(null);
      setVerdict(null);
      setRunResults([]);
      setExplanation("");
      setDebug("");
      setActiveTab("customOutput");

      const res = await API.post("/submissions/run", {
        code: codeText,
        language,
        input: customInput,
      });

      setOutput(res.data.output?.trim());
      toast.success("Custom run successful!");
    } catch (err) {
      toast.error("Custom run failed");
      setOutput(err.response?.data?.error || "Error during custom run.");
    } finally {
      setAction("");
    }
  };

  const handleSubmit = async () => {
    try {
      setExplanation("");
      setAction("submit");
      setOutput(null);
      setVerdict(null);
      setRunResults([]);
      setDebug("");

      const res = await API.post("/submissions/regular", {
        code: codeText,
        language,
        problemCode: code,
      });

      setVerdict(res.data.verdict);
      toast.success("Submitted!");

      const subs = await API.get(`/submissions/mine/${code}`);
      setSubmissions(subs.data);
    } catch {
      setVerdict("Submission Failed");
    } finally {
      setAction("");
    }
  };

  const handleExplain = async () => {
    try {
      setVerdict(null);
      setOutput(null);
      setAction("explain");
      setDebug("");
      setActiveTab("explanation");
      const res = await API.post("/ai/explain", { code: codeText });
      setExplanation(res.data.explanation);
    } catch {
      toast.error("AI explanation failed");
    } finally {
      setAction("");
    }
  };

  const handleDebug = async () => {
    try {
      setVerdict(null);
      setExplanation("");
      setOutput(null);
      setAction("debug");
      setDebug("");
      setActiveTab("debug");
      const res = await API.post("/ai/debug", { code: codeText });
      setDebug(res.data.debug);
    } catch {
      toast.error("Debugging failed.");
    } finally {
      setAction("");
    }
  };

  const renderExplanation = () => {
    const lines = explanation.split("\n").filter(Boolean);
    return lines.map((line, idx) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const codeRegex = /`([^`]+)`/g;

      const highlighted = line
        .replace(boldRegex, '<strong class="text-blue-300">$1</strong>')
        .replace(
          codeRegex,
          '<code class="bg-black/30 text-green-300 px-1 rounded">$1</code>'
        );

      return (
        <p
          key={idx}
          className="text-sm text-white whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        ></p>
      );
    });
  };

  const renderFormattedText = (text) => {
    const lines = text.split("\n").filter(Boolean);

    return lines.map((line, idx) => {
      if (line.startsWith("```")) {
        return null;
      } else if (
        line.startsWith("    ") ||
        line.startsWith("#include") ||
        line.includes("std::") ||
        /^[a-zA-Z0-9_]+ ?\(.*\)/.test(line)
      ) {
        return (
          <pre
            key={idx}
            className="bg-black/40 p-2 rounded text-green-300 text-sm overflow-x-auto"
          >
            {line}
          </pre>
        );
      } else {
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, "<code>$1</code>");

        return (
          <p
            key={idx}
            className="text-sm text-white whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
    });
  };

  if (!problem) return <div className="p-6 text-white">Loading problem...</div>;

  return (
    <div className="p-6 text-white animate-[--animate-fade-in] flex flex-col gap-6 w-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {" "}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow flex-grow">
          <h2 className="text-2xl font-bold mb-2 text-blue-300">
            {problem.name}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Difficulty: <span className="text-white">{problem.difficulty}</span>
          </p>
          <p className="whitespace-pre-line mb-5">{problem.statement}</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {" "}
            <button
              onClick={handleSimplify}
              disabled={action === "simplify"}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
            >
              {action === "simplify" ? "Simplifying..." : "Simplify Problem"}
            </button>
          </div>

          {problem.sampleTestCases.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2 text-white">
                🧪 Sample Test Case(s)
              </h4>
              {problem.sampleTestCases.map((t, i) => (
                <div
                  key={i}
                  className="bg-white/10 p-4 rounded border border-white/10 text-sm mb-4"
                >
                  <p className="mb-2">
                    <span className="text-blue-400 font-semibold">Input:</span>
                    <pre className="bg-black/30 text-white p-2 mt-1 rounded whitespace-pre-wrap text-sm overflow-x-auto">
                      {t.input}
                    </pre>
                  </p>
                  <p>
                    <span className="text-blue-400 font-semibold">
                      Expected Output:
                    </span>
                    <pre className="bg-black/30 text-white p-2 mt-1 rounded whitespace-pre-wrap text-sm overflow-x-auto">
                      {t.expectedOutput}
                    </pre>
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleHint}
              disabled={hintLoading}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition font-medium"
            >
              {hintLoading ? "Getting Hint..." : "💡 Get Hint"}
            </button>
            <button
              onClick={handleBoilerplate}
              disabled={action === "boilerplate"}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded font-semibold"
            >
              {action === "boilerplate"
                ? "Generating..."
                : "Get Boilerplate Code"}
            </button>
          </div>
          {hint && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500 text-white rounded">
              <strong className="text-blue-300">Hint:</strong>
              <p className="mt-2 text-sm whitespace-pre-wrap">{hint}</p>
            </div>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl shadow flex-shrink-0 lg:w-1/3 h-fit">
          {" "}
          <h3 className="text-lg font-semibold mb-4">📜 Submission History</h3>
          {submissions.length === 0 ? (
            <p className="text-gray-400 text-sm">No submissions yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {submissions.map((s) => (
                <li
                  key={s._id}
                  onClick={() => {
                    setViewCode(s.code);
                    setViewLang(s.language);
                    setShowCodeModal(true);
                  }}
                  className="p-2 border border-white/10 rounded hover:bg-white/10 cursor-pointer text-sm"
                >
                  <div className="flex justify-between">
                    <span
                      className={`font-semibold ${
                        s.verdict === "Accepted"
                          ? "text-green-400"
                          : s.verdict === "Wrong Answer"
                          ? "text-red-400"
                          : "text-yellow-300"
                      }`}
                    >
                      {s.verdict}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow flex-grow-[2] lg:w-4/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Code Editor</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 px-3 py-1 rounded-md text-sm"
            >
              {languageOptions.map((lang) => (
                <option
                  key={lang.value}
                  value={lang.value}
                  className="text-black"
                >
                  {lang.name}
                </option>
              ))}
            </select>
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
            }}
          />

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <button
              onClick={handleRun}
              disabled={action === "run"}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-md font-semibold transition"
            >
              {action === "run" ? "Running Sample..." : "Run Code"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={action === "submit"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition"
            >
              {action === "submit" ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={handleExplain}
              disabled={action === "explain"}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-semibold transition"
            >
              {action === "explain" ? "Explaining..." : "Explain My Code"}
            </button>
            <button
              onClick={handleDebug}
              disabled={action === "debug"}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-semibold transition"
            >
              {action === "debug" ? "Debugging..." : " Debug"}
            </button>
          </div>

          {/* Custom Input and Run Button */}
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Custom Input</AccordionTrigger>
              <AccordionContent>
                <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/10">
                  <h4 className="text-lg font-semibold mb-3 text-cyan-300">
                    Run with Custom Input
                  </h4>
                  <textarea
                    className="w-full bg-black/30 text-white p-3 rounded-md text-sm resize-y min-h-[100px] focus:outline-none focus:border-blue-500"
                    placeholder="Enter your custom input here..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  ></textarea>
                  <button
                    onClick={handleCustomRun}
                    disabled={action === "customRun"}
                    className="mt-3 bg-green-500 hover:bg-green-600 text-black px-5 py-2 rounded-md font-semibold transition"
                  >
                    {action === "customRun"
                      ? "Running Custom..."
                      : "Run with Custom Input"}
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Final Verdict (for submission - kept here as direct feedback to editor) */}
          {verdict && (
            <div className="mt-4 p-4 rounded bg-white/10 border border-white/10 text-sm font-semibold text-center">
              {verdict === "Accepted" ? (
                <span className="text-green-400">✅ {verdict}</span>
              ) : verdict === "Wrong Answer" ? (
                <span className="text-red-400">❌ {verdict}</span>
              ) : (
                <span className="text-yellow-300">⚠️ {verdict}</span>
              )}
            </div>
          )}
        </div>

        {/* Right Sub-Panel: Output/Results Area */}
        <div className="bg-black p-6   flex-grow lg:w-2/5">
          {" "}
          {/* flex-grow to take remaining space, lg:w-2/5 for explicit width */}
          <h3 className="text-xl font-semibold mb-4">Results</h3>
          <div className="flex border-b border-white/20">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "runResults"
                  ? "border-2 border-blue-500 text-blue-300 rounded-t-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("runResults")}
            >
              Test Results
            </button>
            <button
              className={`ml-4 px-4 py-2 text-sm font-medium ${
                activeTab === "customOutput"
                  ? "border-2 border-blue-500 text-blue-300 rounded-t-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("customOutput")}
            >
              Custom Output
            </button>
            <button
              className={`ml-4 px-4 py-2 text-sm font-medium ${
                activeTab === "explanation"
                  ? "border-2 border-blue-500 text-blue-300 rounded-t-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("explanation")}
            >
              Explanation
            </button>
            <button
              className={`ml-4 px-4 py-2 text-sm font-medium ${
                activeTab === "debug"
                  ? "border-2 border-blue-500 text-blue-300 rounded-t-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("debug")}
            >
              Debug
            </button>
          </div>
          <div className="mt-4 p-4 bg-white/10 rounded-b-xl border border-white/10 min-h-[400px] max-h-[650px] overflow-y-auto">
            {" "}
            {/* Adjusted min/max height for better fit */}
            {activeTab === "runResults" && (
              <>
                {runResults.length > 0 ? (
                  <div className="space-y-4">
                    {runResults.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded border ${
                          r.passed
                            ? "border-green-400 bg-green-900/20"
                            : "border-red-400 bg-red-900/20"
                        }`}
                      >
                        <p>
                          <strong>Input:</strong>{" "}
                          <code className="bg-black/30 px-1 rounded">
                            {r.input}
                          </code>
                        </p>
                        <p>
                          <strong>Expected:</strong>{" "}
                          <code className="bg-black/30 px-1 rounded">
                            {r.expectedOutput}
                          </code>
                        </p>
                        <p>
                          <strong>Actual:</strong>{" "}
                          <code className="bg-black/30 px-1 rounded">
                            {r.actualOutput}
                          </code>
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {r.passed ? (
                            <span className="text-green-400">✅ Passed</span>
                          ) : (
                            <span className="text-red-400">❌ Failed</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Run code to see test results.</p>
                )}
              </>
            )}
            {activeTab === "customOutput" && (
              <>
                {output !== null ? (
                  <pre className="bg-black/30 text-white p-3 rounded whitespace-pre-wrap text-sm overflow-x-auto">
                    {output}
                  </pre>
                ) : (
                  <p className="text-gray-400">
                    Run with custom input to see output.
                  </p>
                )}
              </>
            )}
            {activeTab === "explanation" && (
              <>
                {explanation ? (
                  <div className="space-y-3">{renderExplanation()}</div>
                ) : (
                  <p className="text-gray-400">
                    Explain your code to see explanation.
                  </p>
                )}
              </>
            )}
            {activeTab === "debug" && (
              <>
                {debug ? (
                  <div className="space-y-2 whitespace-pre-line text-sm text-white">
                    {renderFormattedText(debug)}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    Debug your code to get suggestions.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {simplifyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-[#121212] border border-white/10 rounded-xl w-full max-w-2xl shadow-lg p-6 relative">
            <button
              onClick={() => setSimplifyModal(false)}
              className="absolute top-2 right-3 text-white text-xl hover:text-red-500"
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold mb-3 text-blue-300">
              🧾 Simplified Problem
            </h3>
            <div className="text-sm text-white whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {simplified}
            </div>
          </div>
        </div>
      )}

      {/* View Code Modal (remains unchanged) */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] w-full max-w-3xl p-4 rounded-lg border border-white/10 relative">
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-2 right-3 text-white text-xl"
            >
              ✖
            </button>
            <h4 className="text-white font-bold mb-2 text-lg">
              Previous Submission
            </h4>
            <Editor
              height="400px"
              language={viewLang}
              theme="vs-dark"
              value={viewCode}
              options={{ readOnly: true, fontSize: 14 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;
