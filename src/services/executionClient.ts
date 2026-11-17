
interface ExecutionResult {
    message: string;
    output: string;
    error: string;
    exitCode: number | null;
}

export const executeOnRunner = async (
    userId: number,
    sourceCode: string,
    input: string
): Promise<ExecutionResult> => {

    const response = await fetch(
        "http://localhost:3001/api/runner/test",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                sourceCode,
                input
            })
        }
    );

    if (!response.ok) {
        throw new Error("Execution Server request failed");
    }

    return await response.json() as ExecutionResult;
};

// Main Backend calls executeOnRunner().



// This function sends the input to port 3001.



// Execution Server receives it and runs Java inside Docker.

 

// The result comes back to Main Backend.