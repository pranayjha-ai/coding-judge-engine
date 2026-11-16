
import { Router } from "express";
import {
    createProblem,
    getProblem
} from "../controllers/problems.controllers.js";

const router = Router();

router.post("/", createProblem);

router.get("/:id", getProblem);

export default router;
