import { Pool } from "pg";

export const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "coding_judge",
    password: "Rama02",
    port: 5432,
});

pool.connect()
    .then((client) => {
        console.log("PostgreSQL connected successfully!");

        client.release();
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });