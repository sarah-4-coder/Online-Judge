/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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
        alert("Failed to load submissions.");
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
    if (verdict === "Accepted") return "text-green-600";
    if (verdict === "Wrong Answer") return "text-red-500";
    return "text-yellow-600";
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">My Submissions</h1>

      {isAdmin && (
        <div className="mb-4 text-right">
          <Link
            to="/admin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Add Problem
          </Link>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="bg-white border rounded shadow overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Problem</th>
                <th className="px-6 py-3">Language</th>
                <th className="px-6 py-3">Verdict</th>
                <th className="px-6 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((s) => (
                <tr key={s._id}>
                  <td className="px-6 py-3">{s.problem?.name || "N/A"}</td>
                  <td className="px-6 py-3">{s.language}</td>
                  <td
                    className={`px-6 py-3 font-semibold ${getVerdictColor(
                      s.verdict
                    )}`}
                  >
                    {s.verdict}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(s.submittedAt).toLocaleString()}
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
