import { Request, Response } from "express";
import { pool } from "../config/database.js";
import { evaluateSubmission } from "../services/submissionEvaluation.js";

export const createSubmission = async (req: Request, res: Response) => {
  const { problem_id, language, mode, source_code } = req.body ?? {};
  const userId = req.user?.userId;

  // 1. Validate required fields
  if (
    !userId ||
    problem_id === undefined ||
    !language ||
    !mode ||
    !source_code
  ) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  // Validate IDs without converting BIGINT values to JS numbers
  const validId = (id: unknown) => /^[1-9]\d*$/.test(String(id));

  if (!validId(userId) || !validId(problem_id)) {
    return res.status(400).json({
      message: "Invalid problem_id",
    });
  }

  // 2. Validate language and mode
  if (language !== "JAVA") {
    return res.status(400).json({
      message: "Currently, only JAVA is supported",
    });
  }

  if (!["RUN", "SUBMIT"].includes(mode)) {
    return res.status(400).json({
      message: "Mode must be RUN or SUBMIT",
    });
  }

  if (typeof source_code !== "string" || source_code.trim().length === 0) {
    return res.status(400).json({
      message: "Source code cannot be empty",
    });
  }

  // Maximum source code size: 64 KB
  // if (Buffer.byteLength(source_code, "utf8") > 65536) {
  //     return res.status(400).json({
  //         message: "Source code exceeds 64 KB limit"
  //     });
  // }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 3. Check whether user exists
    const userResult = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [userId],
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Check whether problem exists and is active
    const problemResult = await client.query(
      `SELECT id FROM problems
             WHERE id = $1 AND is_active = TRUE`,
      [String(problem_id)],
    );

    if (problemResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Problem not found or inactive",
      });
    }

    // 5. Save the submission
    const submissionResult = await client.query(
      `INSERT INTO submissions
             (user_id, problem_id, language, source_code, mode)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, user_id, problem_id,
                       language, mode, status, created_at`,
      [userId, String(problem_id), language, source_code, mode],
    );

    const submission = submissionResult.rows[0];

    // 6. Save the submission before execution
    await client.query("COMMIT");

    // 7. Evaluate the submitted code
    const evaluation = await evaluateSubmission(
      String(submission.problem_id),
      source_code,
      Number(userId),
      mode,
    );

    // 8. Update the final submission result
    const updatedSubmission = await pool.query(
      `UPDATE submissions
     SET status = 'COMPLETED',
         verdict = $1,
         completed_at = NOW()
     WHERE id = $2
     RETURNING id, problem_id, mode, status, verdict,
               created_at, completed_at`,
      [evaluation.verdict, submission.id],
    );

    // 9. Return evaluation result
    return res.status(200).json({
      message: "Submission evaluated successfully",
      submission: updatedSubmission.rows[0],
      evaluation,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create submission error:", error);

    return res.status(500).json({
      message: "Failed to create submission",
    });
  } finally {
    client.release();
  }
};

export const getSubmission = async (req: Request, res: Response) => {
  try {
    const submissionId = String(req.params.id);
    const userId = req.user?.userId;

    // Validate IDs
    if (
      !/^[1-9]\d*$/.test(submissionId) ||
      !userId ||
      !/^[1-9]\d*$/.test(userId)
    ) {
      return res.status(400).json({
        message: "Valid submission ID is required",
      });
    }

    // Find submission belonging to this user
    const result = await pool.query(
      `SELECT
                id,
                user_id,
                problem_id,
                language,
                mode,
                status,
                verdict,
                score,
                created_at,
                completed_at
             FROM submissions
             WHERE id = $1 AND user_id = $2`,
      [submissionId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      message: "Submission fetched successfully",
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Get submission error:", error);

    return res.status(500).json({
      message: "Failed to fetch submission",
    });
  }
};
