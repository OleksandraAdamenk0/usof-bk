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

export const updateUser = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const newUser = req.body;
  if (!newUser) return res.status(400).json({error: "Data to update is not found"});
  if (newUser.login) {
    const user = await userService.findByLogin(newUser.login);
    if (user) return res.status(400).json({error: "this login already taken"});
    await userService.updateLogin(userId, newUser.login);
  }
  if (newUser.email) {
    const user = await userService.findByEmail(newUser.email);
    if (user) return res.status(400).json({error: "this email already taken"});
    await userService.updateEmail(userId, newUser.email);
  }
  if (newUser.fullName) await userService.updateFullName(userId, newUser.fullName);
  if (newUser.socials.github) await userService.updateGitHub(userId, newUser.socials.github);
  if (newUser.socials.linkedin) await userService.updateLinkedin(userId, newUser.socials.linkedin);
  res.status(200);
}