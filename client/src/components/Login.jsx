import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      onLogin(data.token);
      alert(data.message || "Logged in!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Unable to login. Check server and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-80">
        <h2 className="mb-4 text-xl font-bold">Login</h2>
        <p className="mb-3 text-sm text-gray-600">
          Demo login: demo@example.com / demo123
        </p>
        <input type="email" placeholder="Email"
          className="w-full p-2 mb-3 border"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password"
          className="w-full p-2 mb-3 border"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full p-2 text-white bg-blue-500 rounded">Login</button>
      </form>
    </div>
  );
}
