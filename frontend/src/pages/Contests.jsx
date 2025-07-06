/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [joinedContests, setJoinedContests] = useState([]);
  const [joiningId, setJoiningId] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await API.get("/contests");
        setContests(res.data);
      } catch {
        toast.error("Failed to fetch contests");
      }
    };

    const fetchJoined = async () => {
    try {
      const res = await API.get("/contests/joined"); 
      setJoinedContests(res.data); 
    } catch (err) {
      console.error("Could not fetch joined contests");
    }
  };

    fetchContests();
    fetchJoined();
  }, []);

  useEffect(() => {
    const updateCountdowns = () => {
      const updated = {};
      contests.forEach((c) => {
        const now = new Date();
        const start = new Date(c.startTime);
        const diff = start - now;

        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          updated[c._id] = `${mins}m ${secs}s`;
        } else {
          updated[c._id] = null;
        }
      });
      setCountdowns(updated);
    };

    const timer = setInterval(updateCountdowns, 1000);
    updateCountdowns(); // initial run
    return () => clearInterval(timer);
  }, [contests]);

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < new Date(start)) return "Upcoming";
    if (now > new Date(end)) return "Ended";
    return "Running";
  };

  const handleJoin = async (contest) => {
    const status = getStatus(contest.startTime, contest.endTime);

    if (status === "Upcoming") {
      toast.warning("Contest has not started yet.");
      return;
    }
    if (status === "Ended") {
      toast.error("Contest is already over.");
      return;
    }

    try {
      setJoiningId(contest._id);
      await API.post("/contests/join", { contestId: contest._id });
      toast.success("Joined Contest");
      navigate(`/contests/${contest._id}`);
    } catch {
      toast.error("Failed to join");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white space-y-6">
      <h2 className="text-3xl font-bold text-blue-300">🏁 Contests</h2>

      {contests.length === 0 ? (
        <p className="text-gray-400">No contests yet.</p>
      ) : (
        <div className="space-y-4">
          {contests.map((c) => {
            const status = getStatus(c.startTime, c.endTime);
            const isJoined = joinedContests.includes(c._id);
            const statusColor =
              status === "Running"
                ? "text-green-400"
                : status === "Upcoming"
                ? "text-yellow-300"
                : "text-red-400";

            return (
              <div
                key={c._id}
                className="p-4 bg-white/5 border border-white/10 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(c.startTime).toLocaleString()} —{" "}
                    {new Date(c.endTime).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span className={`font-bold ${statusColor}`}>{status}</span>
                    {status === "Upcoming" && countdowns[c._id] && (
                      <span className="ml-4 text-sm text-blue-300">
                        ⏳ Starts in: {countdowns[c._id]}
                      </span>
                    )}
                  </p>
                </div>

                {isJoined ? (
                  <span className="mt-3 sm:mt-0 px-4 py-2 rounded font-semibold bg-green-600 text-white">
                    ✅ Joined
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoin(c)}
                    disabled={joiningId === c._id}
                    className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold disabled:opacity-50"
                  >
                    {joiningId === c._id ? "Joining..." : "Join Contest"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Contests;
