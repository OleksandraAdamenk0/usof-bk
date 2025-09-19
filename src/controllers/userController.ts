import {Request, Response} from "express";
import {UserService} from "../services/UserService.js";

const userService = UserService.getInstance();

export const getSocial = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const result = await userService.getSocial(userId);
  console.log(result);
  res.status(200).json({social: result})
}