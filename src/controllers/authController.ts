import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateEmailToken,
  generateRefreshToken,
  verifyEmailToken,
  getUserId
} from "../utils/jwtTokens.js"
import {UserService, UserData} from "../services/UserService.js"
import {sendConfirmationEmail} from "../utils/mail.js";

const HOST=process.env.HOST || 'http://localhost:';
const PORT=process.env.PORT || 5051;
const userService = UserService.getInstance();

export const loginController = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { login, email, password } = req.body;

    const user: UserData | null = await userService.findByLoginEmail(login, email);
    console.log("user: ", user);
    if (!user) return res.status(401).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log("isValid: ", isValid);
    if (!isValid) return res.status(401).json({ message: "Invalid password" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      path: "/"
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      path: "/"
    });

    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
      message: "success"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const { login, email, fullName, password } = req.body;
    const existingLogin = await userService.findByLogin(login);
    if (existingLogin) return res.status(409).json({ message: "Login already exists" });
    const existingEmail = await userService.findByEmail(email);
    if (existingEmail) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id: number = await userService.insert({login, email, fullName: fullName ?? null, password_hash: hashedPassword});
    if (!id) return res.status(500).json({ message: "Internal server error." });

    const emailToken = generateEmailToken(id);
    const url = `${HOST}${PORT}/api/v1/auth/confirm/${emailToken}`;
    console.log("email token: ", emailToken);
    await sendConfirmationEmail(email, url);

    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const confirmEmailController = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) return res.status(400).json({ message: "Token is required" });

    let payload: { id: number };
    try { payload = verifyEmailToken(token); } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }

    const user = await userService.getById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("user to confirm: ",user);
    if (user.is_verified) res.redirect(`${process.env.FRONTEND_URL}/`);

    await userService.verifyEmail(payload.id);

    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const logout = (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  console.log('logout: ', accessToken);
  res.clearCookie("accessToken", { httpOnly: true, path:"/", secure: false, sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, path:"/", secure: false, sameSite: "lax" });
  res.json({ message: "Logged out" });
}

export const authMe = async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const {id, result} = getUserId(accessToken, refreshToken);
  if (result === 401) return res.status(401).json({ message: "Token is required" });
  if (result === 403) return res.status(403).json({ message: "Invalid or expired token" });
  if (typeof id !== "number") return res.status(403).json({ message: "Token is required" });

  const user = await userService.getById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { password_hash, ...userWithoutPassword } = user;
  res.status(200).json({
    user: userWithoutPassword,
    message: "success"
  });
}