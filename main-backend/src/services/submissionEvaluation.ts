
import { pool } from "../config/database.js";
import { executeOnRunner } from "./executionClient.js";

type EvaluationVerdict =
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT_EXCEEDED";

interface TestCaseResult {
    test_case_id: string;
    passed: boolean;
    expected_output: string;
    actual_output: string;
    error: string;
}

interface EvaluationResult {
    verdict: EvaluationVerdict;
    total_test_cases: number;
    passed_test_cases: number;
    results: TestCaseResult[];
}

export const evaluateSubmission = async (
    problemId: string,
    sourceCode: string,
    userId: number,
    mode: "RUN" | "SUBMIT"
): Promise<EvaluationResult> => {

    // 1. Fetch the problem's Java driver code
    const templateResult = await pool.query(
        `SELECT driver_code
         FROM problem_code_templates
         WHERE problem_id = $1
         AND language = 'JAVA'`,
        [problemId]
    );

    if (templateResult.rows.length === 0 ||
        !templateResult.rows[0].driver_code) {
        throw new Error("Driver code not found for this problem");
    }

    const driverCode = templateResult.rows[0].driver_code;

    // 2. Combine driver code and user's solution
    const completeSourceCode = `${driverCode}\n${sourceCode}`;

    // 3. Fetch test cases
    const testCasesResult = await pool.query(
        `SELECT id, input_data, expected_output
         FROM test_cases
         WHERE problem_id = $1
         AND (
             $2 = 'SUBMIT'
             OR is_sample = TRUE
         )
         ORDER BY id`,
        [problemId, mode]
    );

    const testCases = testCasesResult.rows;

    if (testCases.length === 0) {
        throw new Error("No test cases found for this problem");
    }

    const results: TestCaseResult[] = [];
    let verdict: EvaluationVerdict = "ACCEPTED";

    // 4. Execute the combined program for each test case
    for (const testCase of testCases) {

        const execution = await executeOnRunner(
            userId,
            completeSourceCode,
            testCase.input_data
        );

        const actualOutput = execution.output.trim();
        const expectedOutput = testCase.expected_output.trim();

        
        const passed =
            execution.status === "SUCCESS" &&
            actualOutput === expectedOutput;

        results.push({
            test_case_id: String(testCase.id),
            passed,
            expected_output: expectedOutput,
            actual_output: actualOutput,
            error: execution.error
        });

        if (execution.status !== "SUCCESS") {
            switch (execution.status) {
                case "COMPILATION_ERROR":
                case "RUNTIME_ERROR":
                case "TIME_LIMIT_EXCEEDED":
                    verdict = execution.status;
                    break;
            }
            break;
        }

        if (!passed) {
            verdict = "WRONG_ANSWER";
            break;
        }
    }

    // 5. Return the final evaluation
    return {
        verdict,
        total_test_cases: testCases.length,
        passed_test_cases: results.filter(
            result => result.passed
        ).length,
        results
    };
};
