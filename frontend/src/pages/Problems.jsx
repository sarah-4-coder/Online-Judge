import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "sonner";

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
        toast.info("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const getBadge = (difficulty) => {
    const base = "text-xs px-2 py-1 rounded-full font-semibold";
    if (difficulty === "Easy") return `${base} bg-green-700 text-green-100`;
    if (difficulty === "Medium") return `${base} bg-yellow-600 text-white`;
    return `${base} bg-red-600 text-white`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-zinc-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[--animate-fade-in]">
      {/* Problem List */}
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold mb-4 text-white">📘 Problem List</h2>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-white/10 text-gray-300 text-sm uppercase">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/problems/${p.code}`)}
                  className="border-t border-white/10 hover:bg-white/10 transition cursor-pointer"
                >
                  <td className="p-4 font-semibold text-blue-400">{p.name}</td>
                  <td className="p-4 text-gray-400">{p.code}</td>
                  <td className="p-4">
                    <span className={getBadge(p.difficulty)}>{p.difficulty}</span>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No problems available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="animate-[--animate-fade-in] delay-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">🏆 Leaderboard</h2>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-gray-300 text-sm uppercase">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr key={user.userId} className="border-t border-white/10 hover:bg-white/10 transition">
                  <td className="p-3 font-bold">{index + 1}</td>
                  <td className="p-3 truncate max-w-[140px] text-blue-300">{user.fullName}</td>
                  <td className="p-3 font-semibold text-green-400">{user.totalAccepted}</td>
                </tr>
              ))}
              {leaders.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-400">
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
