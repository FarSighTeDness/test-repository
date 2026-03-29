import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert(data.message || "Registered!");
      navigate("/login");
    } catch (error) {
      alert(error.message || "Unable to register. Check server and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-80">
        <h2 className="mb-4 text-xl font-bold">Register</h2>
        <input type="email" placeholder="Email"
          className="w-full p-2 mb-3 border"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password"
          className="w-full p-2 mb-3 border"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full p-2 text-white bg-green-500 rounded">Register</button>
      </form>
    </div>
  );
}
