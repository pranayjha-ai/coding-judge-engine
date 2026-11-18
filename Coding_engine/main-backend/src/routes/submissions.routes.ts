
import { Router } from "express";

import {
    createSubmission,
    getSubmission
} from "../controllers/submissions.controllers.js";

const router = Router();

router.post("/", createSubmission);

router.get("/:id", getSubmission);

export default router;
