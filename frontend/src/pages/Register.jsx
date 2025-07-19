import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black from-zinc-900 to-black flex items-center justify-center text-white font-mono">
      <div className="bg-black backdrop-blur-md  p-8 rounded-xl shadow-lg w-full max-w-lg animate-[--animate-fade-in]">
        <h2 className="text-3xl font-bold text-center mb-6">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-gray-800 placeholder-gray-500 text-gray-200 focus:outline-none border border-gray-700 focus:border-blue-500 transition-colors duration-200"
            required
          />
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
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-gray-800 placeholder-gray-500 text-gray-200 focus:outline-none border border-gray-700 focus:border-blue-500 transition-colors duration-200"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-2.5 rounded-md shadow-sm"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
