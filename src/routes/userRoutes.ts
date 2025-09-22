import {Router} from "express";
import {getSocial, updateUser} from "../controllers/userController.js";
import {optionalAuthMiddleware, strictAuthMiddleware} from "../middleware/AuthMiddleware.js";

const userRouter = Router();

userRouter.get("/getSocial", strictAuthMiddleware, getSocial);

userRouter.patch("/update", strictAuthMiddleware, updateUser);

export default userRouter;