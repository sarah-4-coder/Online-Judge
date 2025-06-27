import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [auth, setAuth] = useState({ loading: true, allowed: false });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/me");
        const user = res.data.user;

        if (adminOnly && user.role !== "admin") {
          setAuth({ loading: false, allowed: false });
        } else {
          setAuth({ loading: false, allowed: true });
        }
      } catch {
        setAuth({ loading: false, allowed: false });
      }
    };

    checkAuth();
  }, []);

  if (auth.loading) return <div className="p-6">Checking auth...</div>;

  return auth.allowed ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
