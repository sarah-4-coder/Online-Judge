import { useState, useEffect } from "react";
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
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runHistory, setRunHistory] = useState([]); // State for run history
  const [showHistoryModal, setShowHistoryModal] = useState(false); // State for history modal
  const [viewHistoryCode, setViewHistoryCode] = useState(""); // State for code in history modal
  const [viewHistoryLang, setViewHistoryLang] = useState(""); // State for language in history modal

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("compilerRunHistory");
      if (storedHistory) {
        setRunHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load run history from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("compilerRunHistory", JSON.stringify(runHistory));
    } catch (error) {
      console.error("Failed to save run history to local storage", error);
    }
  }, [runHistory]);

  const handleRun = async () => {
    if (!codeText.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }

    let submissionName = prompt("Enter a name for this code run (optional):");
    if (!submissionName || submissionName.trim() === "") {
      submissionName = `${language}-${new Date().toLocaleString()}`;
    }

    setIsRunning(true);
    setRunResult(null);

    try {
      const res = await API.post("/submissions/run", {
        code: codeText,
        language,
        input: customInput,
      });

      const newRun = {
        name: submissionName, 
        code: codeText,
        language,
        input: customInput,
        output: res.data.output,
        error: res.data.error || null,
        timestamp: new Date().toLocaleString(),
      };

      setRunResult({ output: res.data.output, error: res.data.error });

      setRunHistory((prevHistory) => {
        const existingIndex = prevHistory.findIndex(
          (entry) => entry.code === codeText && entry.language === language
        );

        if (existingIndex !== -1) {
          const updatedHistory = [...prevHistory];
          updatedHistory[existingIndex] = { ...newRun }; 
          return updatedHistory;
        } else {
          return [newRun, ...prevHistory];
        }
      });

      toast.success("Code executed successfully!");
    } catch (err) {
      console.error("Code execution failed:", err);
      const errorMessage = err.response?.data?.message || "Code execution failed.";
      const newRun = {
        name: submissionName, 
        code: codeText,
        language,
        input: customInput,
        output: null,
        error: errorMessage,
        timestamp: new Date().toLocaleString(),
      };

      setRunResult({ error: errorMessage });

      setRunHistory((prevHistory) => {
        const existingIndex = prevHistory.findIndex(
          (entry) => entry.code === codeText && entry.language === language
        );

        if (existingIndex !== -1) {
          const updatedHistory = [...prevHistory];
          updatedHistory[existingIndex] = { ...newRun };
          return updatedHistory;
        } else {
          return [newRun, ...prevHistory];
        }
      });

      toast.error(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewHistoryEntry = (entry) => {
    setViewHistoryCode(entry.code);
    setViewHistoryLang(entry.language);
    setShowHistoryModal(true); // Open the modal to show the code
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-blue-400 text-center mb-8">
          Code Compiler
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor Section */}
          <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-md lg:col-span-2">
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
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition-colors duration-200"
              >
                View History ({runHistory.length})
              </button>
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
              className="w-full h-32 bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-y"
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-black w-full max-w-4xl p-6 rounded-lg shadow-2xl border border-gray-700 relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-bold text-blue-400">Run History</h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white text-3xl font-semibold transition-colors duration-200"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            {runHistory.length === 0 ? (
              <p className="text-gray-400 text-center">No run history yet.</p>
            ) : (
              <div className="overflow-y-auto pr-2 flex-grow">
                {runHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 p-4 rounded-md mb-4 border border-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => handleViewHistoryEntry(entry)} 
                  >
                    <div>
                      <h5 className="text-lg font-semibold text-blue-300">{entry.name}</h5>
                      <span className="text-sm text-gray-400">{entry.timestamp}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                      }`}
                    >
                      {entry.error ? 'Error' : 'Success'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showHistoryModal && viewHistoryCode && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] w-full max-w-3xl p-4 rounded-lg border border-white/10 relative">
            <button
              onClick={() => {
                setViewHistoryCode("");
                setViewHistoryLang("");
              }}
              className="absolute top-2 right-3 text-white text-xl"
            >
              ✖
            </button>
            <h4 className="text-white font-bold mb-2 text-lg">
              Code from History
            </h4>
            <Editor
              height="400px"
              language={viewHistoryLang}
              theme="vs-dark"
              value={viewHistoryCode}
              options={{ readOnly: true, fontSize: 14 }}
            />
             <div className="mt-4 text-sm">
                <p className="text-gray-300 mb-2"><strong>Input:</strong></p>
                <pre className="bg-gray-800 p-2 rounded text-gray-200 overflow-auto whitespace-pre-wrap">{runHistory.find(r => r.code === viewHistoryCode && r.language === viewHistoryLang)?.input || "(No input)"}</pre>
                <p className="text-gray-300 mt-4 mb-2"><strong>Output:</strong></p>
                <pre className="bg-gray-800 p-2 rounded text-gray-200 overflow-auto whitespace-pre-wrap">{runHistory.find(r => r.code === viewHistoryCode && r.language === viewHistoryLang)?.output || runHistory.find(r => r.code === viewHistoryCode && r.language === viewHistoryLang)?.error || "(No output)"}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompilerPage;