
import { spawn } from "child_process";
import path from "path";

interface JavaExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

export const executeJava = (
    input: string
): Promise<JavaExecutionResult> => {

    return new Promise((resolve, reject) => {

        // Get the absolute path of our Java file folder
        const folderPath = path.resolve("runner-test")
            .replace(/\\/g, "/");

        // Start Docker
        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",
            "-v",
            `${folderPath}:/app`,
            "-w",
            "/app",
            "eclipse-temurin:21-jdk",
            "java",
            "Main.java"
        ]);

        let stdout = "";
        let stderr = "";

        // Capture Java program output
        docker.stdout.on("data", (data: Buffer) => {
            stdout += data.toString();
        });

        // Capture errors
        docker.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        // Handle Docker errors
        docker.on("error", (error) => {
            reject(error);
        });

        // Send input to Java through stdin
        docker.stdin.end(input);

        // Wait until Docker finishes
        docker.on("close", (code) => {
            resolve({
                stdout,
                stderr,
                exitCode: code
            });
        });
    });
};
