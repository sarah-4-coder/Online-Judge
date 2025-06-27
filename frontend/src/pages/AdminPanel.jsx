import { useState } from "react";
import API from "../services/api";
import { toast } from "sonner";

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    difficulty: "Easy",
    statement: "",
    sampleTestCases: [{ input: "", expectedOutput: "" }],
    hiddenTestCases: [{ input: "", expectedOutput: "" }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (type, index, field, value) => {
    const updated = [...formData[type]];
    updated[index][field] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const addTestCase = (type) => {
    setFormData({
      ...formData,
      [type]: [...formData[type], { input: "", expectedOutput: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/problems", formData);
      toast.success("Problem created successfully");
      setFormData({
        name: "",
        code: "",
        difficulty: "Easy",
        statement: "",
        sampleTestCases: [{ input: "", expectedOutput: "" }],
        hiddenTestCases: [{ input: "", expectedOutput: "" }],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding problem");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 animate-[--animate-fade-in]">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-blue-300">🛠 Add New Problem</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="input"
            name="name"
            placeholder="Problem Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            name="code"
            placeholder="Problem Code (e.g. SUM100)"
            value={formData.code}
            onChange={handleChange}
            required
          />

          <select
            className="input"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <textarea
            className="input h-32"
            name="statement"
            placeholder="Problem Statement"
            value={formData.statement}
            onChange={handleChange}
            required
          />

          {/* Sample Test Cases */}
          <div>
            <h4 className="font-semibold mb-2 text-white">🧪 Sample Test Cases</h4>
            {formData.sampleTestCases.map((test, idx) => (
              <div key={idx} className="mb-3 space-y-2">
                <textarea
                  className="input"
                  placeholder="Input"
                  value={test.input}
                  onChange={(e) =>
                    handleTestCaseChange("sampleTestCases", idx, "input", e.target.value)
                  }
                />
                <textarea
                  className="input"
                  placeholder="Expected Output"
                  value={test.expectedOutput}
                  onChange={(e) =>
                    handleTestCaseChange("sampleTestCases", idx, "expectedOutput", e.target.value)
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTestCase("sampleTestCases")}
              className="text-sm text-blue-400 hover:underline mt-2"
            >
              + Add Sample
            </button>
          </div>

          {/* Hidden Test Cases */}
          <div>
            <h4 className="font-semibold mb-2 text-white">🔒 Hidden Test Cases</h4>
            {formData.hiddenTestCases.map((test, idx) => (
              <div key={idx} className="mb-3 space-y-2">
                <textarea
                  className="input"
                  placeholder="Input"
                  value={test.input}
                  onChange={(e) =>
                    handleTestCaseChange("hiddenTestCases", idx, "input", e.target.value)
                  }
                />
                <textarea
                  className="input"
                  placeholder="Expected Output"
                  value={test.expectedOutput}
                  onChange={(e) =>
                    handleTestCaseChange("hiddenTestCases", idx, "expectedOutput", e.target.value)
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTestCase("hiddenTestCases")}
              className="text-sm text-blue-400 hover:underline mt-2"
            >
              + Add Hidden
            </button>
          </div>

          <button type="submit" className="btn">
            Submit Problem
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
