import { spawn } from "node:child_process";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
const EXECUTION_TIMEOUT_MS = 8000;
import { randomUUID } from "node:crypto";
type JavaExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  status:
    | "SUCCESS"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT_EXCEEDED";
};
export const executeJava = async (
  userId: number,
  sourceCode: string,
  input: string,
): Promise<JavaExecutionResult> => {
  // 1. Set the project folder where Java files will be created
  //   const executionId = randomUUID();

const workDir = path.resolve("runner-test");
  try {
    // 2. Create the folder if it doesn't exist
    await mkdir(workDir, { recursive: true });

    // 3. Create Main.java automatically
    const className = `User_${userId}`;
    const fileName = `${className}.java`;

    const javaFilePath = path.join(workDir, fileName);
    const updatedSourceCode = sourceCode.replace(
      /\bpublic\s+class\s+Main\b/,
      `public class ${className}`,
    );

    await writeFile(javaFilePath, updatedSourceCode, "utf8");
    console.log("Generated Java file:", javaFilePath);
    // 3. Prepare folder path for Docker
    const folderPath = workDir.replace(/\\/g, "/");

// Step 4: Compile Java source code inside Docker
const compilation = await new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
}>((resolve, reject) => {
    const docker = spawn("docker", [
        "run",
        "--rm",
        "--network", "none",
        "--memory=256m",
        "--cpus=0.5",
        "--pids-limit=64",
        "-v",
        `${folderPath}:/app`,
        "-w",
        "/app",
        "eclipse-temurin:21-jdk",
        "javac",
        fileName
    ]);

    let stdout = "";
    let stderr = "";

    docker.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
    });

    docker.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
    });

    docker.on("error", reject);

    docker.on("close", (code) => {
        resolve({
            stdout,
            stderr,
            exitCode: code
        });
    });
});

// If compilation fails, return immediately
if (compilation.exitCode !== 0) {
    return {
        stdout: compilation.stdout,
        stderr: compilation.stderr,
        exitCode: compilation.exitCode,
        status: "COMPILATION_ERROR"
    };
}

console.log("Java compilation successful");

    // 4. Run Java file inside Docker
    const containerName = `java-run-${randomUUID()}`;


const result = await new Promise<JavaExecutionResult>((resolve, reject) => {
    const docker = spawn("docker", [
        "run",
        "--rm",
        "--name",
        containerName,
        "-i",
        "--network",
        "none",
        "--memory=256m",
        "--cpus=0.5",
        "--pids-limit=64",
        "-v",
        `${folderPath}:/app`,
        "-w",
        "/app",
        "eclipse-temurin:21-jdk",
        "java",
        className
    ]);

      let stdout = "";
      let stderr = "";

     let timedOut = false;

const timeout = setTimeout(() => {
    timedOut = true;

    const killer = spawn("docker", [
        "rm",
        "-f",
        containerName
    ]);

    killer.on("error", (error) => {
        console.error("Failed to stop Docker container:", error);
    });
}, EXECUTION_TIMEOUT_MS);


      docker.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      docker.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      docker.on("error", (error) => {
        reject(error);
      });

     docker.on("close", (code) => {
    clearTimeout(timeout);

    const status: JavaExecutionResult["status"] = timedOut
        ? "TIME_LIMIT_EXCEEDED"
        : code === 0
            ? "SUCCESS"
            : "RUNTIME_ERROR";

    resolve({
        stdout,
        stderr,
        exitCode: code,
        status,
    });
});

      docker.stdin.end(input);
    });

    return result;
  } finally {
    // 5. Delete temporary directory after execution
    // await rm(workDir, {
    //     recursive: true,
    //     force: true
    // });
  }
};