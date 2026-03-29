import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 text-white bg-gray-800">
      <h1 className="text-lg font-bold">Auth Demo</h1>
      <div className="space-x-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">
              Login
            </Link>
            <Link to="/register" className="hover:text-green-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
