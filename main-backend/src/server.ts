import express from "express";
import { pool } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import problemsRoutes from "./routes/problems.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import runnerRoutes from "./routes/runner.routes.js";
import executionRoutes from "./routes/execution.routes.js";

const app = express();
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
    app.use("/api/problems", problemsRoutes);
    app.use("/api/submissions", submissionsRoutes);
    app.use("/api/runner", runnerRoutes);
    app.use("/api/execution", executionRoutes);
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


