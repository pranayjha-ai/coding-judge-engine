
import { Request, Response } from "express";
import { executeJava } from "../services/javaRunner.js";

export const testJavaRunner = async (
    req: Request,
    res: Response
) => {
    try {
        const { input } = req.body;

        const result = await executeJava(input ?? "");

        return res.status(200).json({
            message: "Java execution completed",
            output: result.stdout,
            error: result.stderr,
            exitCode: result.exitCode
        });

    } catch (error) {
        console.error("Java runner error:", error);

        return res.status(500).json({
            message: "Java execution failed"
        });
    }
};
