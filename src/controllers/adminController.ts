import {Request, Response} from "express";
import {UserData, UserService} from "../services/UserService.js";
import {CategoryService} from "../services/CategoryService.js";
import {WorkspaceService} from "../services/WorkspaceService.js";
import {WorkspacesUsersService} from "../services/WorkspacesUsersService.js";
import {TagService} from "../services/TagService.js";

import bcrypt from "bcrypt";

const userService = UserService.getInstance();
const categoryService = CategoryService.getInstance();
const workspaceService = WorkspaceService.getInstance();
const workspacesUsersService = WorkspacesUsersService.getInstance();
const tagService = TagService.getInstance();

const checkUser = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  if (!userId) return res.status(500).send();
  const user = await userService.getById(userId);
  if (!user) return res.status(500).send();
  if (user.role !== "admin") return res.status(403).send();
}

export const getAllUsers = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const result = await userService.getAll();
  return res.status(200).json(result);
}

export const getAllCategories = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const workspaces = await workspaceService.getAll();
  const categories = await categoryService.getAll();

  categories.map(c => c.workspace = workspaces.find(w => w.id === c.workspace)?.name ?? "Unknown");

  return res.status(200).json(categories);
}

export const getAllWorkspaces = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const workspaces = await workspaceService.getAll();
  const users = await userService.getAll();

  const result = await Promise.all(workspaces.map(async w => {
    const WUData = await workspacesUsersService.getForWorkspace(w.id);
    const usersData = WUData?.map(wud => users.find(u => u.id === wud.user));
    return {
      ...w,
      owner: users.find(u => u.id === w.owner),
      users: usersData,
    }
  }))

  console.log(result)
  return res.status(200).json(result);
}

export const getAllTags = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const workspaces = await workspaceService.getAll();
  const users = await userService.getAll();
  const tags = await tagService.getAll();

  const result = tags.map(t => {
    return {
      id : t.id,
      title: t.title,
      workspace: t.workspace,
      workspaceName: workspaces.find(w => w.id === t.workspace)?.name,
      author: t.author,
      user: users.find(w => w.id === t.author),
    }
  });

  return res.status(200).json(result);
}

export const createUser = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const {password, ...user} = req.body;
  const existingLogin = await userService.findByLogin(user.login);
  if (existingLogin) return res.status(409).json({ message: "Login already exists" });
  const existingEmail = await userService.findByEmail(user.email);
  if (existingEmail) return res.status(409).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await userService.create({...user, password_hash: hashedPassword});
  return res.status(200).json(result);
}

export const createCategory = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const category = req.body;
  const existingTitle = await categoryService.findByTitle(category.title);
  if (existingTitle) return res.status(409).json({ message: "Category with this title already exists" });

  const result = await categoryService.create(category);
  return res.status(200).json(result);
}

export const createTag = async (req: Request, res: Response) => {
  await checkUser(req, res);
  // @ts-ignore
  const userId = req.userId;

  const tag = req.body;
  tag.author = userId;
  const existingTitle = await tagService.findByTitle(tag.title);
  if (existingTitle) return res.status(409).json({ message: "Tag with this title already exists" });

  const result = tagService.create(tag);
  return res.status(200).json(result);
}

export const createWorkspace = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const {users, ...workspace} = req.body;
  const existingName = await workspaceService.findByName(workspace.name);
  if (existingName) return res.status(409).json({ message: "Workspace with this name already exists" });
  const result = workspaceService.insert(workspace);

  for (const user of users) if (user.id) await workspacesUsersService.insert({workspace: workspace.id, user: user.id})

  return res.status(200).json(result);
}

export const updateUser = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const {password, id, ...user} = req.body;
  const existingLogin = await userService.findByLogin(user.login);
  if (existingLogin && existingLogin.id !== id) return res.status(409).json({ message: "Login already taken" });
  const existingEmail = await userService.findByEmail(user.email);
  if (existingEmail && existingEmail.id !== id) return res.status(409).json({ message: "Email already taken" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await userService.update(id, {...user, password_hash: hashedPassword});
  console.log(result);
  return res.status(200).json(id);
}

export const updateCategory = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const category = req.body;
  const existingTitle = await categoryService.findByTitle(category.title);
  if (existingTitle && existingTitle.id !== category.id) return res.status(409).json({ message: "Category with this title already exists" });

  const result = await categoryService.update(category.id, category);
  return res.status(200).json(result);
}

export const updateTag = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const tag = req.body;

  const existingTitle = await tagService.findByTitle(tag.title);
  if (existingTitle) return res.status(409).json({ message: "Tag with this title already exists" });

  const result = await tagService.update(tag.id, tag);
  return res.status(200).json(result);
}

export const deleteUser = async (req: Request, res: Response) => {
  await checkUser(req, res);

  const id = Number(req.params.id);
  if (!id) return res.status(400).json({error: "Data to delete is not found"});
  const result = await userService.deleteById(id);
  res.status(200).json({result});
}

export const deleteCategory = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({error: "Data to delete is not found"});
  const result = await categoryService.deleteById(id);
  res.status(200).json(result);
}

export const deleteTag = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({error: "Data to delete is not found"});
  const result = await tagService.deleteById(id);
  res.status(200).json(result);
}

export const deleteWorkspace = async (req: Request, res: Response) => {
  await checkUser(req, res);
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({error: "Data to delete is not found"});
  const result = await workspaceService.deleteById(id);
  res.status(200).json(result);
}