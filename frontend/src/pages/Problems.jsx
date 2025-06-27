import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Problems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, leadersRes] = await Promise.all([
          API.get("/problems"),
          API.get("/leaderboard"),
        ]);
        setProblems(problemsRes.data);
        setLeaders(leadersRes.data);
      } catch {
        alert("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const getBadge = (difficulty) => {
    const base = "text-xs px-2 py-1 rounded-full font-medium";
    if (difficulty === "Easy") return `${base} bg-green-100 text-green-600`;
    if (difficulty === "Medium") return `${base} bg-yellow-100 text-yellow-700`;
    return `${base} bg-red-100 text-red-600`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Problem List */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">All Problems</h2>
        <div className="bg-white shadow overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/problems/${p.code}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="p-3 font-medium text-blue-600">{p.name}</td>
                  <td className="p-3 text-gray-500">{p.code}</td>
                  <td className="p-3">
                    <span className={getBadge(p.difficulty)}>{p.difficulty}</span>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={3}>
                    No problems available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">🏆 Leaderboard</h2>
        <div className="bg-white rounded shadow border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr key={user.userId} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-semibold">{index + 1}</td>
                  <td className="p-2 truncate max-w-[150px]">{user.fullName}</td>
                  <td className="p-2 font-semibold text-green-600">{user.totalAccepted}</td>
                </tr>
              ))}
              {leaders.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-400">
                    No rankings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Problems;
