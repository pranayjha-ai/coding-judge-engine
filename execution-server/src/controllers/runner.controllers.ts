import { Request, Response } from "express";
import { executeJava } from "../services/javaRunner.js";

export const testJavaRunner = async (req: Request, res: Response) => {
  try {
    const { userId, sourceCode, input } = req.body;

    if (!sourceCode) {
      return res.status(400).json({
        message: "Java source code is required",
      });
    }

    const result = await executeJava(Number(userId), sourceCode, input ?? "");

   return res.status(200).json({
    message: "Java execution completed",
    output: result.stdout,
    error: result.stderr,
    exitCode: result.exitCode,
    status: result.status
});
  } catch (error) {
    console.error("Java runner error:", error);

    return res.status(500).json({
      message: "Java execution failed",
    });
  }
};
