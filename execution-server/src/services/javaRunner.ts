import { spawn } from "node:child_process";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
// import { randomUUID } from "node:crypto";
type JavaExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};
export const executeJava = async (
  userId: number,
  sourceCode: string,
  input: string,
): Promise<JavaExecutionResult> => {
  // 1. Set the project folder where Java files will be created
  //   const executionId = randomUUID();

  const workDir = path.resolve("execution-server", "runner-test");
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

    // 4. Run Java file inside Docker
    const result = await new Promise<JavaExecutionResult>((resolve, reject) => {
      const docker = spawn("docker", [
        "run",
        "--rm",
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
        fileName,
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

      docker.on("close", (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code,
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
