import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    dob: ""
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", formData);
      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input className="input" type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="input" type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input className="input" type="date" name="dob" onChange={handleChange} required />
        <button className="btn" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
