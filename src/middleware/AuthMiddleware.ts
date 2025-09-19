import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService.js";
import {generateAccessToken, verifyAccessToken, verifyRefreshToken} from "../utils/jwtTokens.js";

const userService: UserService = UserService.getInstance();

interface AuthRequest extends Request {
  userId?: number | null;
}

export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = req.cookies || {};
    req.userId = null;

    if (!accessToken && !refreshToken) return next();

    try {
      const payload = verifyAccessToken(accessToken!);
      req.userId = payload.id;
      return next();
    } catch (err) {
      console.log("Access token invalid or expired:", (err as Error).message);

      if (!refreshToken) {
        return next();
      }

      try {
        const payload = verifyRefreshToken(refreshToken);
        const userId = payload.id;
        console.log("refresh user: ", userId);

        const user = await userService.getById(userId);
        if (!user) {
          req.userId = null;
          return next();
        }

        const newAccessToken = generateAccessToken(userId);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/"
        });

        req.userId = userId;
        return next();
      } catch (err) {
        console.log("Refresh token invalid:", (err as Error).message);
        return next();
      }
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    return next();
  }
};

export const strictAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = req.cookies || {};
    req.userId = null;

    if (!accessToken && !refreshToken) res.status(401).json({ message: "Not authorized" });

    try {
      const payload = verifyAccessToken(accessToken!);
      req.userId = payload.id;
      return next();
    } catch (err) {
      console.log("Access token invalid or expired:", (err as Error).message);

      if (!refreshToken) res.status(401).json({ message: "Not authorized" });

      try {
        const payload = verifyRefreshToken(refreshToken);
        const userId = payload.id;
        console.log("refreshed user: ", userId);

        const user = await userService.getById(userId);
        if (!user) res.status(401).json({ message: "Not authorized" });

        const newAccessToken = generateAccessToken(userId);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/"
        });

        req.userId = userId;
        return next();
      } catch (err) {
        console.log("Refresh token invalid:", (err as Error).message);
        res.status(401).json({ message: "Not authorized" });
      }
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Not authorized" });
  }
};
