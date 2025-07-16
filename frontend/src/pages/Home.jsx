import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center"> 
        <h1 className="text-4xl font-bold mb-4">Welcome to Online Judge</h1>
        <p className="mb-6">Solve coding problems and test your skills!</p>
        <div className="flex justify-center gap-4">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;