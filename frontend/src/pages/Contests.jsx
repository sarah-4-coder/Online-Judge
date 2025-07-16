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
        const end = new Date(c.endTime);

        let diff;
        let countdownText = null;

        if (now < start) { // Upcoming
          diff = start - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          countdownText = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        } else if (now < end) { // Running
          diff = end - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          countdownText = `Ends in: ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        } else { // Ended
          countdownText = null;
        }
        updated[c._id] = countdownText;
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
      toast.success("Successfully joined contest!");
      const res = await API.get("/contests/joined");
      setJoinedContests(res.data);
    } catch (err) {
        if (err.response && err.response.status === 200 && err.response.data.message === "Already joined") {
             toast.info("You have already joined this contest.");
             const status = getStatus(contest.startTime, contest.endTime);
             if (status === "Running") {
                navigate(`/contests/${contest._id}`);
             }
        } else {
            toast.error("Failed to join contest: " + (err.response?.data?.message || err.message));
        }
    } finally {
      setJoiningId(null);
    }
  };

  const handleEnterContest = (contest) => {
      const status = getStatus(contest.startTime, contest.endTime);
      const isJoined = joinedContests.includes(contest._id);

      if (status === "Running" && isJoined) {
          navigate(`/contests/${contest._id}`);
      } else if (status === "Upcoming") {
          toast.info("This contest has not started yet.");
      } else if (status === "Ended") {
          toast.info("This contest has already ended.");
      } else if (!isJoined) {
          toast.warning("You must join the contest before entering.");
      }
  };

  const formatContestDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-black from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-4xl font-extrabold text-blue-400 text-center mb-10 tracking-wide">
          🏁 Competitive Contests
        </h2>

        {contests.length === 0 ? (
          <p className="text-gray-400 text-center text-lg mt-8">No contests available yet. Check back later!</p>
        ) : (
          <div className="bg-black rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-white/10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contest Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {contests.map((c) => {
                  const status = getStatus(c.startTime, c.endTime);
                  const isJoined = joinedContests.includes(c._id);
                  const countdownValue = countdowns[c._id];

                  const startTime = new Date(c.startTime);
                  const endTime = new Date(c.endTime);
                  const durationMs = endTime - startTime;
                  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <tr key={c._id} className="hover:bg-white/10 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-300">{c.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">{c.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatContestDate(c.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {`${durationHours}h ${durationMinutes}m`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {status === "Ended" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-600 text-white">
                            Ended
                          </span>
                        ) : (
                          <div className="flex items-center">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              status === "Running" ? "bg-green-600" : "bg-yellow-600"
                            } text-white`}>
                              {status}
                            </span>
                            {countdownValue && (
                              <span className="ml-2 text-xs text-blue-300 font-medium animate-pulse">
                                {countdownValue}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {status === "Ended" ? (
                          <span className="text-gray-500 cursor-not-allowed">
                            N/A
                          </span>
                        ) : isJoined ? (
                          <button
                            onClick={() => handleEnterContest(c)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-xs font-semibold transition-colors duration-200"
                          >
                            ✅ Enter
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoin(c)}
                            disabled={joiningId === c._id || status === "Upcoming"}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-xs font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {joiningId === c._id ? "Joining..." : "Join"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;