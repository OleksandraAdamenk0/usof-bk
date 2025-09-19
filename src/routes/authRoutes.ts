import {Router} from "express";
import {strictAuthMiddleware} from "../middleware/AuthMiddleware"
import {confirmEmailController, loginController, registerController, logout, authMe} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/login", (req, res, next) => {
  console.log("POST /login hit");
  next();
}, loginController);

authRouter.post("/register", async (req, res, next) => {
  console.log("POST /register hit");
  next();
}, registerController);

authRouter.get("/confirm/:token", confirmEmailController);

authRouter.post("/logout", (req, res, next) => {
  console.log("POST /logout hit");
  next();
}, logout)

authRouter.get("/me", authMe);

authRouter.get("/", async (req, res) => {
  res.send("Welcome");
})

export default authRouter;