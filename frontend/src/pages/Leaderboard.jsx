/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import API from "../services/api";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get("/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        alert("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Leaderboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border rounded shadow overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Accepted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaders.map((user, index) => (
                <tr key={user.userId}>
                  <td className="px-6 py-3 font-bold">{index + 1}</td>
                  <td className="px-6 py-3">{user.fullName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 font-semibold text-green-600">{user.totalAccepted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
