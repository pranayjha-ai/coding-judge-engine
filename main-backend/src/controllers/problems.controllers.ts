
import { Request, Response } from "express";
import { pool } from "../config/database.js";

export const createProblem = async (req: Request, res: Response) => {
    const {
        title,
        description,
        difficulty,
        time_limit_ms,
        memory_limit_mb,
        starter_code,
        test_cases
    } = req.body;

    // 1. Validate required fields
    if (!title || !description || !difficulty || !starter_code) {
        return res.status(400).json({
            message: "Title, description, difficulty and starter_code are required"
        });
    }

    const allowedDifficulties = ["EASY", "MEDIUM", "HARD"];

    if (!allowedDifficulties.includes(difficulty)) {
        return res.status(400).json({
            message: "Difficulty must be EASY, MEDIUM or HARD"
        });
    }

    if (!Array.isArray(test_cases) || test_cases.length === 0) {
        return res.status(400).json({
            message: "At least one test case is required"
        });
    }

    // Validate test cases
    for (const test of test_cases) {
        if (
            typeof test.input_data !== "string" ||
            typeof test.expected_output !== "string" ||
            typeof test.is_sample !== "boolean" ||
            !Number.isInteger(test.points) ||
            test.points < 0
        ) {
            return res.status(400).json({
                message: "Invalid test case data"
            });
        }
    }

    // 2. Get a database connection for the transaction
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 3. Insert problem
        const problemResult = await client.query(
            `INSERT INTO problems
            (title, description, difficulty, time_limit_ms, memory_limit_mb)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                title.trim(),
                description.trim(),
                difficulty,
                time_limit_ms ?? 2000,
                memory_limit_mb ?? 128
            ]
        );

        const problem = problemResult.rows[0];

        // 4. Insert Java starter code
        await client.query(
            `INSERT INTO problem_code_templates
            (problem_id, language, starter_code)
            VALUES ($1, $2, $3)`,
            [problem.id, "JAVA", starter_code]
        );

        // 5. Insert all test cases
        for (const test of test_cases) {
            await client.query(
                `INSERT INTO test_cases
                (problem_id, input_data, expected_output, is_sample, points)
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    problem.id,
                    test.input_data,
                    test.expected_output,
                    test.is_sample,
                    test.points
                ]
            );
        }

        // 6. Save everything permanently
        await client.query("COMMIT");

        return res.status(201).json({
            message: "Problem created successfully",
            problem
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create problem error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });

    } finally {
        client.release();
    }
};




export const getProblem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Get problem details
        const problemResult = await pool.query(
            `SELECT id, title, description, difficulty,
                    time_limit_ms, memory_limit_mb
             FROM problems
             WHERE id = $1 AND is_active = TRUE`,
            [id]
        );

        if (problemResult.rows.length === 0) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        const problem = problemResult.rows[0];

        // 2. Get Java starter code
        const templateResult = await pool.query(
            `SELECT starter_code
             FROM problem_code_templates
             WHERE problem_id = $1 AND language = 'JAVA'`,
            [id]
        );

        // 3. Get only visible sample test cases
        const testCasesResult = await pool.query(
            `SELECT input_data, expected_output, explanation
             FROM test_cases
             WHERE problem_id = $1 AND is_sample = TRUE
             ORDER BY id ASC`,
            [id]
        );

        // 4. Send response
        return res.status(200).json({
            problem,
            starter_code: templateResult.rows[0]?.starter_code ?? null,
            examples: testCasesResult.rows.map((test, index) => ({
                example: index + 1,
                input: test.input_data,
                output: test.expected_output,
                explanation: test.explanation
            }))
        });

    } catch (error) {
        console.error("Get problem error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
