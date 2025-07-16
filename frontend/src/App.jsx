import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Problems from "./pages/Problems";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import ProblemDetail from "./pages/ProblemDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import { Toaster } from "./components/ui/sonner";
import Contests from "./pages/Contests";
import ContestDashboard from "./pages/ContestDashboard";
import ContestProblem from "./pages/ContestProblem";
import AdminCreateContest from "./pages/AdminCreateContest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/contests"
          element={
            <ProtectedRoute>
              <Layout>
                <Contests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Layout>
                <Problems />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems/:code"
          element={
            <ProtectedRoute>
              <Layout>
                <ProblemDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contests/create"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminCreateContest />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ContestDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests/:contestId/problems/:problemCode"
          element={
            <ProtectedRoute>
              <Layout>
                <ContestProblem />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster richColors />
    </BrowserRouter>
  );
}

export default App;
