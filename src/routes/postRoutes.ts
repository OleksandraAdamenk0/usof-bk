import {Router} from "express";
import {getPosts, getPost, getRecent, getPostComments, postCount, toggleSavePost, toggleReaction, getReaction, addComment} from "../controllers/postController.js";
import {optionalAuthMiddleware, strictAuthMiddleware} from "../middleware/AuthMiddleware.js";

const postRouter = Router();

postRouter.get("/", optionalAuthMiddleware, getPosts);

postRouter.get("/recent/", strictAuthMiddleware, getRecent);

postRouter.get('/count',postCount);

postRouter.post('/save', strictAuthMiddleware, toggleSavePost);

postRouter.post('/reaction/:reactionType', strictAuthMiddleware, toggleReaction);

postRouter.get('/:postId/reaction/:reactionType', strictAuthMiddleware, getReaction);

postRouter.get('/:postId', strictAuthMiddleware, getPost);

postRouter.get('/:postId/comments', strictAuthMiddleware, getPostComments);

postRouter.post('/:postId/comments/add', strictAuthMiddleware, addComment);

export default postRouter;
