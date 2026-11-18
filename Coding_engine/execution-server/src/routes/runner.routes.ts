import { Router } from "express";
import { testJavaRunner } from "../controllers/runner.controllers.js";

const router = Router();

router.post("/test", testJavaRunner);

export default router;