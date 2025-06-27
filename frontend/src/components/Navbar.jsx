/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      alert("Logged out");
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 shadow bg-white sticky top-0 z-10">
      <Link to="/" className="text-2xl font-bold text-blue-600">Online Judge</Link>
      <div className="flex items-center space-x-6">
        <Link to="/problems" className="hover:underline">Problems</Link>
        <Link to="/profile" className="hover:underline">Profile</Link>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
