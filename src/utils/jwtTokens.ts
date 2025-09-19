import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_EXPIRATION = '1d';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret';
const JWT_REFRESH_EXPIRATION = '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const JWT_MAIL_SECRET = process.env.JWT_MAIL_SECRET || 'your_mail_secret';
const JWT_MAIL_EXPIRATION = "24h"

console.log("JWT_SECRET:", JWT_SECRET);
console.log("JWT_REFRESH_SECRET:", JWT_REFRESH_SECRET);

export function generateAccessToken (id: number) {
  return jwt.sign({ id: id}, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function generateRefreshToken(id: number) {
  return jwt.sign({ id:id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
}

export function generateEmailToken(id: number) {
  return jwt.sign({ id: id }, JWT_MAIL_SECRET, { expiresIn: JWT_MAIL_EXPIRATION });
}

export const verifyEmailToken = (token: string): { id: number } => {
  if (!token) throw new Error("Token is required");
  try {
    console.log("token: ",token);
    return jwt.verify(token, JWT_MAIL_SECRET as string) as { id: number };
  } catch (err) {
    console.log(err);
    throw new Error("Invalid or expired token");
  }
};

export const verifyAccessToken = (token: string): {id: number} => {
  if (!token) throw new Error("Token is required");
  try {
    return jwt.verify(token, JWT_SECRET as string) as { id: number };
  } catch (err) {
    console.log(err);
    throw new Error("Invalid or expired token");
  }
}

export const verifyRefreshToken = (token: string): {id: number} => {
  if (!token) throw new Error("Token is required");
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET as string) as { id: number };
  } catch (err) {
    console.log(err);
    throw new Error("Invalid or expired token");
  }
}

export const getUserId = (
  accessToken: string,
  refreshToken: string
): { id: number | null; result: number } => {
  console.log("getUserId called");
  console.log("accessToken:", accessToken);
  console.log("refreshToken:", refreshToken);

  if (!accessToken) {
    console.log("No access token provided");
    return { id: null, result: 401 };
  }

  try {
    const payload = verifyAccessToken(accessToken);
    console.log("Access token valid, payload:", payload);
    return { id: payload.id, result: 200 };
  } catch (err: any) {
    console.log("Access token invalid:", err.message || err);

    if (!refreshToken) {
      console.log("No refresh token provided");
      return { id: null, result: 403 };
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      console.log("Refresh token valid, payload:", payload);
      return { id: payload.id, result: 200 };
    } catch (err: any) {
      console.log("Refresh token invalid:", err.message || err);
      return { id: null, result: 403 };
    }
  }
};
