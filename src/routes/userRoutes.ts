import {Router} from "express";
import {getSocial} from "../controllers/userController.js";
import {optionalAuthMiddleware, strictAuthMiddleware} from "../middleware/AuthMiddleware.js";

const userRouter = Router();

userRouter.get("/getSocial", strictAuthMiddleware, getSocial)

export default userRouter;