import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "sonner";

const ContestDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await API.get(`/contests/${id}`);
        setContest(res.data);
        updateTimeLeft(res.data.endTime);
        const timer = setInterval(() => updateTimeLeft(res.data.endTime), 1000);
        setIntervalId(timer);
      } catch (err) {
        toast.error(err.response?.data?.message || "Error loading contest");
        navigate("/contests");
      }
    };

    fetchContest();
    return () => clearInterval(intervalId);
  }, [id]);

  const updateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("Contest Over");
      clearInterval(intervalId);
    } else {
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    }
  };

  if (!contest) return <div className="p-6 text-white">Loading contest...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold text-blue-300">{contest.name}</h2>
      <p className="text-sm text-gray-400 mb-2">🕒 Ends in: <span className="text-yellow-300">{timeLeft}</span></p>

      <div className="mt-6 bg-white/5 p-4 rounded shadow border border-white/10">
        <h3 className="text-xl font-semibold mb-4">📘 Contest Problems</h3>
        <ul className="space-y-2">
          {contest.problems.map((p, i) => (
            <li key={p._id} className="p-3 rounded bg-white/10 border border-white/10 hover:bg-white/20">
              <Link to={`/contests/${id}/problems/${p.code}`} className="text-blue-400 font-medium">
                {String.fromCharCode(65 + i)}. {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContestDashboard;
