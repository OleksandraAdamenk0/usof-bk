import {Router} from "express";
import authRouter from "./authRoutes.js";
import postRouter from "./postRoutes.js";
import userRouter from "./userRoutes.js";
import adminRouter from "./adminRoutes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/posts", postRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
export default router;