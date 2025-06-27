import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/login", formData);
      alert("Login successful");
      navigate("/problems");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="input" type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
