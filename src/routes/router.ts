import {Router} from "express";
import authRouter from "./authRoutes.js";
import postRouter from "./postRoutes.js";
import userRouter from "./userRoutes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/posts", postRouter);
router.use("/user", userRouter);

export default router;