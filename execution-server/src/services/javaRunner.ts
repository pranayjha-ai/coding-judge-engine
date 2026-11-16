
import { spawn } from "node:child_process";
import path from "node:path"; //work with file &  directory paths

type JavaExecutionResult ={
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

export const executeJava = (
    input: string
): Promise<JavaExecutionResult> => {

    return new Promise((resolve, reject) => {

        const folderPath = path.resolve("runner-test")
            .replace(/\\/g, "/");

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

        docker.stdout.on("data", (data: Buffer) => {
            stdout += data.toString();
        });

        docker.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        docker.on("error", (error) => {
            reject(error);
        });

        docker.stdin.end(input);

        docker.on("close", (code) => {
            resolve({
                stdout,
                stderr,
                exitCode: code
            });
        });
    });
};
