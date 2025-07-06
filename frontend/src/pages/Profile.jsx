/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "sonner";

const Profile = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await API.get("/submissions/mine");
        setSubmissions(res.data);
      } catch (err) {
        toast.error("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    const checkRole = async () => {
      try {
        const res = await API.get("/auth/me");
        setIsAdmin(res.data.user?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };

    fetchSubmissions();
    checkRole();
  }, []);

  const getVerdictColor = (verdict) => {
    if (verdict === "Accepted") return "text-green-400";
    if (verdict === "Wrong Answer") return "text-red-400";
    return "text-yellow-300";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-white animate-[--animate-fade-in]">
      <h1 className="text-3xl font-bold mb-6 text-blue-300">
        📂 My Submissions
      </h1>

      {isAdmin && (
        <div className="mb-6 text-right">
          <Link
            to="/admin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            ➕ Add Problem
          </Link>
          <Link
            to="/admin/contests/create"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
          >
            ➕ Create New Contest
          </Link>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-gray-400">No submissions yet.</p>
      ) : (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/10 text-gray-300 uppercase">
              <tr>
                <th className="px-6 py-3">Problem</th>
                <th className="px-6 py-3">Language</th>
                <th className="px-6 py-3">Verdict</th>
                <th className="px-6 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {submissions.map((s) => (
                <tr key={s._id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-3 text-blue-300">
                    {s.problem?.name || "N/A"}
                  </td>
                  <td className="px-6 py-3">{s.language}</td>
                  <td
                    className={`px-6 py-3 font-semibold ${getVerdictColor(
                      s.verdict
                    )}`}
                  >
                    {s.verdict}
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-sm">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleString()
                      : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Profile;
