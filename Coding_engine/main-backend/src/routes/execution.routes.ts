import { Router } from "express";
import { testExecutionConnection } from "../controllers/execution.controllers.js";

const router = Router();

router.post("/test", testExecutionConnection);

export default router;