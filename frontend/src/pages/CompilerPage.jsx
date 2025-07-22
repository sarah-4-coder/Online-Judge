import { useState } from "react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import API from "../services/api";

const languageOptions = [
  { name: "C++", value: "cpp" },
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
];

const CompilerPage = () => {
  const [codeText, setCodeText] = useState("// Write your code here");
  const [language, setLanguage] = useState("cpp");
  const [customInput, setCustomInput] = useState("");
  const [runResult, setRunResult] = useState(null); // To store { output: '...', error: '...' }
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!codeText.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }
    setIsRunning(true);
    setRunResult(null);
    try {
      const res = await API.post("/submissions/run", {
        code: codeText,
        language,
        input: customInput,
      });
      setRunResult({ output: res.data.output, error: res.data.error });
      toast.success("Code executed successfully!");
    } catch (err) {
      console.error("Code execution failed:", err);
      const errorMessage = err.response?.data?.message || "Code execution failed.";
      setRunResult({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-blue-400 text-center mb-8">
          Code Compiler
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Section */}
          <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-200">Code Editor</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-gray-200 text-sm px-3 py-1.5 rounded-md border border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.name}
                  </option>
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
                fontFamily: "Fira Code, monospace",
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isRunning ? "Running..." : "Run Code"}
              </button>
            </div>
          </div>

          {/* Input/Output Section */}
          <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Input</h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your custom input here (optional)..."
              className="w-full h-40 bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-y"
            />

            <h3 className="text-xl font-semibold text-gray-200 mt-6 mb-4">Output</h3>
            {runResult && (
              <div className="flex-grow">
                {runResult.output ? (
                  <pre className="bg-gray-950 text-gray-100 p-3 rounded text-sm overflow-auto border border-gray-700 h-full">
                    {runResult.output}
                  </pre>
                ) : (
                  <pre className="bg-gray-950 text-gray-400 p-3 rounded text-sm overflow-auto border border-gray-700 h-full">
                    (No output)
                  </pre>
                )}
                {runResult.error && (
                  <div className="mt-4">
                    <h5 className="text-md font-semibold text-red-500 mb-2">Error:</h5>
                    <pre className="bg-red-900/20 text-red-400 p-3 rounded text-sm overflow-auto border border-red-600">
                      {runResult.error}
                    </pre>
                  </div>
                )}
              </div>
            )}
            {!runResult && (
              <p className="text-gray-400 text-sm h-full flex items-center justify-center border border-gray-700 rounded bg-gray-950">
                Run your code to see the output.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerPage;