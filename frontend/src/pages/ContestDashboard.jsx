import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

const ContestDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("problems");

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [viewCode, setViewCode] = useState("");
  const [viewLang, setViewLang] = useState("cpp");

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await API.get(`/contests/${id}`);
        setContest(res.data);
        updateTimeLeft(res.data.endTime);
        const timer = setInterval(() => updateTimeLeft(res.data.endTime), 1000);
        return () => clearInterval(timer);
      } catch (err) {
        toast.error(err.response?.data?.message || "Error loading contest");
        navigate("/contests");
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await API.get(`/contests/${id}/submissions`);
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to load contest submissions", err);
        toast.error("Failed to load contest submissions.");
      }
    };

    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const res = await API.get(`/leaderboard/contest/${id}`);
        setLeaderboard(res.data);
      } catch (err) {
        console.error("Failed to load contest leaderboard", err);
        toast.error("Failed to load contest leaderboard.");
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchContest();
    fetchSubmissions();
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [id, navigate, activeTab]);

  const updateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("Contest Over");
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    }
  };

  const isSolved = (code) => {
    return submissions.some(
      (s) => s.problemCode === code && s.verdict === "Accepted"
    );
  };

  const handleViewCode = (submissionCode, submissionLanguage) => {
    setViewCode(submissionCode);
    setViewLang(submissionLanguage);
    setShowCodeModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-md">
          <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-1">{contest?.name}</h2>
            <p className="text-gray-400 text-sm">{contest?.description}</p>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4 text-right">
            <p className="text-lg font-bold text-yellow-400">⏳ {timeLeft}</p>
            <p className="text-xs text-gray-500">Ends at: {new Date(contest?.endTime).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => setActiveTab("problems")}
            className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
              activeTab === "problems"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
              activeTab === "submissions"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            My Submissions
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
              activeTab === "leaderboard"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === "problems" && (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Contest Problems</h3>
            {contest?.problems.length === 0 ? (
                <p className="text-gray-500 text-sm">No problems added to this contest yet.</p>
            ) : (
                <ul className="space-y-2">
                {contest?.problems.map((p, i) => {
                    const solved = isSolved(p.code);
                    return (
                    <li
                        key={p._id}
                        className="bg-gray-800 p-3 rounded-md border border-gray-700 hover:bg-gray-700 transition-colors duration-200 flex justify-between items-center"
                    >
                        <Link
                        to={`/contests/${id}/problems/${p.code}`}
                        className={`text-base font-medium ${
                            solved ? "text-green-500" : "text-blue-400 hover:underline"
                        }`}
                        >
                        {String.fromCharCode(65 + i)}. {p.name}
                        </Link>
                        {solved && (
                        <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 font-semibold text-xs rounded-full">
                            Solved
                        </span>
                        )}
                    </li>
                    );
                })}
                </ul>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-xl font-bold text-blue-400 mb-4">My Submissions</h3>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-sm">You haven't made any submissions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Problem
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Lang
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Verdict
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {submissions.map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-800 transition-colors duration-200">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-300">
                            {s.problemName || s.problemCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {s.language}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              s.verdict === "Accepted"
                                ? "bg-green-500/20 text-green-400"
                                : s.verdict === "Wrong Answer"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {s.verdict}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {new Date(s.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewCode(s.code, s.language)}
                            className="text-blue-500 hover:text-blue-400 font-semibold focus:outline-none py-1 px-2 rounded-md border border-blue-500 hover:border-blue-400"
                          >
                            View Code
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Contest Leaderboard</h3>
            {leaderboardLoading ? (
              <p className="text-gray-500 text-sm">Loading leaderboard...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-gray-500 text-sm">No participants yet or no submissions to generate leaderboard.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Participant
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Solved
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Penalty (mins)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {leaderboard.map((entry) => (
                      <tr key={entry.userId} className="hover:bg-gray-800 transition-colors duration-200">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                            <span className={`inline-block w-5 h-5 text-center text-xs leading-5 rounded-full ${entry.rank <= 3 ? 'bg-yellow-500 text-gray-900' : 'bg-gray-600 text-white'}`}>
                                {entry.rank}
                            </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-300">
                          {entry.fullName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500 font-medium">
                          {entry.problemsSolved}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-400">
                          {entry.totalPenalty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showCodeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-4xl p-4 rounded-lg shadow-2xl border border-gray-700 relative flex flex-col max-h-[90vh] h-full"> {/* Added h-full to explicitly give it height relative to parent */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xl font-bold text-blue-400">Submitted Code</h4>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-semibold transition-colors duration-200"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              <div className="flex-grow overflow-hidden rounded-md border border-gray-700">
                 <Editor
                  height="100%"
                  language={viewLang}
                  theme="vs-dark"
                  value={viewCode}
                  options={{
                    readOnly: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    fontFamily: "Fira Code, monospace",
                    lineNumbersMinChars: 3,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDashboard;