import { Request, Response } from "express";
import { executeOnRunner } from "../services/executionClient.js";

export const testExecutionConnection = async (
    req: Request,
    res: Response
) => {
    try {
        const { input } = req.body;

        const result = await executeOnRunner(input ?? "");

        return res.status(200).json({
            message: "Main Backend successfully communicated with Execution Server",
            result
        });

    } catch (error) {
        console.error("Execution connection error:", error);

        return res.status(500).json({
            message: "Could not communicate with Execution Server"
        });
    }
};