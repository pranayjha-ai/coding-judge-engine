import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import problemsRoutes from "./routes/problems.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import runnerRoutes from "./routes/runner.routes.js";
import executionRoutes from "./routes/execution.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Coding Judge Backend is running!");
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend is healthy"
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/problems", authenticate, problemsRoutes);
app.use("/api/submissions", authenticate, submissionsRoutes);
app.use("/api/runner", authenticate, runnerRoutes);
app.use("/api/execution", authenticate, executionRoutes);
// Start server only after database connection succeeds
async function startServer() {
    try {
        await pool.query("SELECT NOW()");

        console.log("PostgreSQL connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

startServer();


