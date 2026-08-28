import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quiltPlannerRouter from "./quilt-planner";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quiltPlannerRouter);

export default router;
