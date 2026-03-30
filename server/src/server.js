import express from "express";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.js";
import pool from "../config/db.js";

dotenv.config();

const app = express();

if (!process.env.JWT_SECRET) {
  console.error("Missing required environment variable: JWT_SECRET");
  process.exit(1);
}

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "Auth API is running" });
});

app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);
  return res.status(500).json({ message: "Internal server error" });
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL");
    client.release();

    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || "0.0.0.0";
    const server = app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the existing process or set PORT to a different value.`);
      } else {
        console.error("Server listen error:", err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });
