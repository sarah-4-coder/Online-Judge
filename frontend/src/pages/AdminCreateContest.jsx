import { useState } from "react";
import API from "../services/api";
import { toast } from "sonner";

const AdminCreateContest = () => {
  const [contestInfo, setContestInfo] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState({
    name: "",
    code: "",
    difficulty: "Easy",
    statement: "",
    sampleTestCases: [{ input: "", expectedOutput: "" }],
    hiddenTestCases: [{ input: "", expectedOutput: "" }],
    boilerplate: "",
  });

  const [action, setAction] = useState("");

  const handleContestChange = (e) => {
    setContestInfo({ ...contestInfo, [e.target.name]: e.target.value });
  };

  const handleProblemChange = (e) => {
    setCurrentProblem({ ...currentProblem, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (type, index, field, value) => {
    const updated = [...currentProblem[type]];
    updated[index][field] = value;
    setCurrentProblem({ ...currentProblem, [type]: updated });
  };

  const addTestCase = (type) => {
    setCurrentProblem({
      ...currentProblem,
      [type]: [...currentProblem[type], { input: "", expectedOutput: "" }],
    });
  };

  const addProblemToList = () => {
    if (!currentProblem.name || !currentProblem.statement) {
      toast.error("Fill problem name and statement.");
      return;
    }
    setProblems([...problems, currentProblem]);
    setCurrentProblem({
      name: "",
      code: "",
      difficulty: "Easy",
      statement: "",
      sampleTestCases: [{ input: "", expectedOutput: "" }],
      hiddenTestCases: [{ input: "", expectedOutput: "" }],
      boilerplate: "",
    });
    toast.success("Problem added to contest.");
  };

  const handleCreateContest = async () => {
    try {
      if (!contestInfo.title || problems.length === 0) {
        toast.error("Please fill contest info and add at least one problem.");
        return;
      }

      await API.post("/contests", {
        name: contestInfo.title, // <-- map title to name
        description: contestInfo.description,
        startTime: contestInfo.startTime,
        endTime: contestInfo.endTime,
        problems,
      });

      toast.success("Contest created successfully!");
      setContestInfo({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      });
      setProblems([]);
    } catch {
      toast.error("Failed to create contest");
    }
  };

  const generateWithAI = async () => {
    try {
      setAction("generate");
      const res = await API.post("/ai/generate-problem", {
        topic: "arrays",
        difficulty: currentProblem.difficulty,
      });
      setCurrentProblem(res.data);
    } catch {
      toast.error("AI generation failed");
    } finally {
      setAction("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white space-y-6 animate-[--animate-fade-in]">
      <h2 className="text-3xl font-bold mb-4">🎯 Create Contest</h2>

      {/* Contest Info */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
        <input
          className="w-full p-2 bg-white/10 rounded text-white"
          name="title"
          placeholder="Contest Title"
          value={contestInfo.title}
          onChange={handleContestChange}
        />
        <textarea
          className="w-full p-2 bg-white/10 rounded text-white"
          name="description"
          placeholder="Contest Description"
          value={contestInfo.description}
          onChange={handleContestChange}
        />
        <div className="flex gap-4">
          <input
            type="datetime-local"
            className="p-2 bg-white/10 rounded text-white w-full"
            name="startTime"
            value={contestInfo.startTime}
            onChange={handleContestChange}
          />
          <input
            type="datetime-local"
            className="p-2 bg-white/10 rounded text-white w-full"
            name="endTime"
            value={contestInfo.endTime}
            onChange={handleContestChange}
          />
        </div>
      </div>

      {/* Problem Creator */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">➕ Add Problem</h3>
          <button
            onClick={generateWithAI}
            className="bg-purple-600 px-4 py-1 rounded hover:bg-purple-700 text-white text-sm"
          >
            {action === "generate" ? "Generating..." : "✨ AI Generate"}
          </button>
        </div>
        <input
          className="w-full p-2 bg-white/10 rounded text-white"
          name="name"
          placeholder="Problem Name"
          value={currentProblem.name}
          onChange={handleProblemChange}
        />
        <input
          className="w-full p-2 bg-white/10 rounded text-white"
          name="code"
          placeholder="Unique Problem Code"
          value={currentProblem.code}
          onChange={handleProblemChange}
        />
        <select
          name="difficulty"
          value={currentProblem.difficulty}
          onChange={handleProblemChange}
          className="bg-white/10 px-3 py-2 rounded text-white"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <textarea
          className="w-full p-2 bg-white/10 rounded text-white h-32"
          name="statement"
          placeholder="Problem Statement"
          value={currentProblem.statement}
          onChange={handleProblemChange}
        />

        {/* Sample Test Cases */}
        <div>
          <h4 className="text-sm font-semibold">🧪 Sample Test Cases</h4>
          {currentProblem.sampleTestCases.map((test, idx) => (
            <div key={idx} className="space-y-1 mb-2">
              <textarea
                className="w-full bg-white/10 p-2 rounded text-sm"
                placeholder="Input"
                value={test.input}
                onChange={(e) =>
                  handleTestCaseChange(
                    "sampleTestCases",
                    idx,
                    "input",
                    e.target.value
                  )
                }
              />
              <textarea
                className="w-full bg-white/10 p-2 rounded text-sm"
                placeholder="Expected Output"
                value={test.expectedOutput}
                onChange={(e) =>
                  handleTestCaseChange(
                    "sampleTestCases",
                    idx,
                    "expectedOutput",
                    e.target.value
                  )
                }
              />
            </div>
          ))}
          <button
            onClick={() => addTestCase("sampleTestCases")}
            className="text-blue-400 hover:underline text-sm"
          >
            + Add Sample
          </button>
        </div>

        {/* Hidden Test Cases */}
        <div>
          <h4 className="text-sm font-semibold">🔒 Hidden Test Cases</h4>
          {currentProblem.hiddenTestCases.map((test, idx) => (
            <div key={idx} className="space-y-1 mb-2">
              <textarea
                className="w-full bg-white/10 p-2 rounded text-sm"
                placeholder="Input"
                value={test.input}
                onChange={(e) =>
                  handleTestCaseChange(
                    "hiddenTestCases",
                    idx,
                    "input",
                    e.target.value
                  )
                }
              />
              <textarea
                className="w-full bg-white/10 p-2 rounded text-sm"
                placeholder="Expected Output"
                value={test.expectedOutput}
                onChange={(e) =>
                  handleTestCaseChange(
                    "hiddenTestCases",
                    idx,
                    "expectedOutput",
                    e.target.value
                  )
                }
              />
            </div>
          ))}
          <button
            onClick={() => addTestCase("hiddenTestCases")}
            className="text-blue-400 hover:underline text-sm"
          >
            + Add Hidden
          </button>
        </div>

        <button
          onClick={addProblemToList}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white mt-2"
        >
          ➕ Add Problem to Contest
        </button>
      </div>

      {/* List of added problems */}
      {problems.length > 0 && (
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <h4 className="text-lg font-semibold mb-3">📝 Added Problems</h4>
          <ul className="list-disc pl-5 text-sm text-white space-y-1">
            {problems.map((p, i) => (
              <li key={i}>
                <span className="text-blue-300 font-semibold">{p.name}</span> -{" "}
                {p.difficulty}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleCreateContest}
        className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded text-white font-semibold"
      >
        🚀 Create Contest
      </button>
    </div>
  );
};

export default AdminCreateContest;
