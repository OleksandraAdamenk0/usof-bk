import {Router} from "express";
import {getAllUsers, createUser, updateUser, getAllCategories, getAllWorkspaces, deleteUser, deleteCategory,
  createCategory, updateCategory, getAllTags, deleteTag, createTag, updateTag, createWorkspace, deleteWorkspace} from "../controllers/adminController.js";
import {optionalAuthMiddleware, strictAuthMiddleware} from "../middleware/AuthMiddleware.js";

const adminRouter = Router();

adminRouter.get("/user/all", strictAuthMiddleware, getAllUsers);
adminRouter.post('/user/create', strictAuthMiddleware, createUser);
adminRouter.patch('/user/update', strictAuthMiddleware, updateUser);
adminRouter.delete("/user/:id", strictAuthMiddleware, deleteUser);


adminRouter.get('/category/all', strictAuthMiddleware, getAllCategories);
adminRouter.delete('/category/:id', strictAuthMiddleware, deleteCategory);
adminRouter.post('/category/create', strictAuthMiddleware, createCategory);
adminRouter.patch('/category/update', strictAuthMiddleware, updateCategory)

adminRouter.get('/workspace/all', strictAuthMiddleware, getAllWorkspaces);
adminRouter.post('/workspace/create', strictAuthMiddleware, createWorkspace);
adminRouter.delete('/workspace/:id', strictAuthMiddleware, deleteWorkspace);

adminRouter.get('/tag/all', strictAuthMiddleware, getAllTags);
adminRouter.delete('/tag/:id', strictAuthMiddleware, deleteTag);
adminRouter.post('/tag/create', strictAuthMiddleware, createTag);
adminRouter.patch('/tag/update', strictAuthMiddleware, updateTag);

export default adminRouter;