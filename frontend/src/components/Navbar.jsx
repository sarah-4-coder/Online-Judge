/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "sonner";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      toast.success("Logged out");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="sticky top-0 z-20 w-full bg-white/10 backdrop-blur border-b border-white/20 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition"
        >
          Online Judge
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/contests" className="hover:text-yellow-400 transition">
            Contests
          </Link>
          <Link to="/problems" className="hover:text-blue-300 transition">
            Problems
          </Link>
          <Link to="/profile" className="hover:text-blue-300 transition">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
