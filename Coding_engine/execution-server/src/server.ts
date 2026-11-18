
import express from "express";
import runnerRoutes from "./routes/runner.routes.js";

const app = express();

const PORT = 3001;

app.use(express.json());

// Register runner routes
app.use("/api/runner", runnerRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Execution Server is running"
    });
});

app.listen(PORT, () => {
    console.log(`Execution Server running at http://localhost:${PORT}`);
});
