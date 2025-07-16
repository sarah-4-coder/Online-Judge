import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/login", form);
      toast.success("Login Successful");
      navigate("/problems"); // Or wherever you redirect after login
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-400 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-gray-200 mb-6 text-center">
          Welcome Back 👋
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-gray-800 placeholder-gray-500 text-gray-200 focus:outline-none border border-gray-700 focus:border-blue-500 transition-colors duration-200"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-gray-800 placeholder-gray-500 text-gray-200 focus:outline-none border border-gray-700 focus:border-blue-500 transition-colors duration-200"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-semibold py-3 rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors duration-200">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;