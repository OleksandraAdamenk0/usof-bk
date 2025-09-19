import {Request, Response} from "express";
import {PostService} from "../services/PostService.js";
import {ContentItemService} from "../services/ContentItemService.js";
import {UserService} from "../services/UserService.js";
import {TagService} from "../services/TagService.js";
import {PostsTagsService, PostsTagsData} from "../services/PostsTagsService.js";
import {PostsCategoriesService} from "../services/PostsCategories.js";
import {CategoryService} from "../services/CategoryService.js";
import {ReactionService} from "../services/ReactionService.js";
import {SavedPostService} from "../services/SavedPostService.js";
import {CommentService, CommentData} from "../services/CommentService.js";

const userService = UserService.getInstance();
const postService = PostService.getInstance();
const tagService = TagService.getInstance();
const postsTagsService = PostsTagsService.getInstance();
const contentItemService = ContentItemService.getInstance();
const categoryService = CategoryService.getInstance();
const reactionService = ReactionService.getInstance();
const commentService = CommentService.getInstance();
const postsCategoriesService = PostsCategoriesService.getInstance();
const savedPostService = SavedPostService.getInstance();

export const postCount = async (req: Request, res: Response) => {
  const count = await postService.getPostsCount();
  console.log(count);
  res.status(200).json({count: count})
}

export const toggleSavePost = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const postId = req.body.id;

  if (typeof userId !== "number" || typeof postId !== "number") {res.status(401).json({error: "Not authorized"});}

  try {
    const result = await postService.toggleSavePost(userId, postId);
    console.log(result);
    res.status(200).json({status: result});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

export const toggleReaction = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const params = req.params;
  const reactionType = params.reactionType;
  const postId = req.body.id;

  if (!["like", "dislike", "love", "laugh", "angry"].includes(reactionType)) return res.status(400).json({error: "Wrong reaction type"});

  try {
    const result = await reactionService.toggleReaction(userId, postId, reactionType as "like" | "dislike" | "love" | "laugh" | "angry");
    console.log(result);
    res.status(200).json({status: result});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle reaction" });
  }
}

export const getReaction = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const params = req.params;
  const postId = Number(params.postId);
  const reactionType = params.reactionType;

  if (!["like", "dislike", "love", "laugh", "angry"].includes(reactionType)) return res.status(400).json({error: "Wrong reaction type"});

  try {
    const result = await reactionService.getReaction(userId, postId, reactionType as "like" | "dislike" | "love" | "laugh" | "angry");
    console.log(result);
    res.status(200).json({status: result});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reaction" });
  }
}

export const getRecent = async (req: Request, res: Response) => {
  // @ts-ignore
  const id = req.userId;
  const amount = Number(req.query.amount) || 5;

  try {
    const rows = await contentItemService.getRecent(id, amount);
    console.log(rows);
    const posts = await Promise.all(
      rows.map(async row => ({
        id: row.id,
        title: await postService.getTitle(row.id)
      }))
    )
    res.status(200).json({posts: posts});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent posts" });
  }

}

export const getPosts = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const size = Number(req.query.size) || 5;
  const offset = (page - 1) * size;

  // @ts-ignore
  const id = req.userId;
  console.log("getPosts: ", id);

    try {
      const rows = await postService.getPosts(id || 0, offset, size);
      // if (rows) {
      //   rows.forEach(row => {
      //     console.log(row);
      //   })
      // }

      if (!rows) return res.status(500).json({error: "No posts found."});

      const posts = await Promise.all(
        rows.map(async row => ({
          id: row.contentItemId,
          author: {
            id: row.userId,
            login: row.login,
            profilePicture: row.profilePicture
          },
          title: row.title,
          content: row.content,
          tags: row.tags || [],
          category: row.category,
          likes: await reactionService.getReactionCount(row.contentItemId, 'like'),
          dislikes: await reactionService.getReactionCount(row.contentItemId, 'dislike'),
          comments: await commentService.getCommentsCount(row.contentItemId),
          isLiked: await reactionService.getReaction(id, row.contentItemId, 'like'),
          isDisliked: await reactionService.getReaction(id, row.contentItemId, 'dislike'),
          views: row.views,
          isSaved: Boolean(row.isSaved),
        }))
      );

      console.log(posts)

      res.json({ posts:  posts});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
}

export const getPost = async (req: Request, res: Response) => {
  const params = req.params;
  const postId = Number(params.postId);
  // @ts-ignore
  const userId = req.userId;
  console.log("getPost userId: ", userId, "postId: ", postId);
  const postData = await postService.getPost(postId);
  if (postData === null) return res.status(404).json({error: "No post found"})
  const contentItemData = await contentItemService.getById(postData.contentItemId);
  if (!contentItemData) return res.status(404).json({error: "No content item found"})
  const authorData = await userService.getById(contentItemData.author);
  if (!authorData) return res.status(404).json({error: "No author found"})
  const tags = await postsTagsService.getTagsForPost(contentItemData.id);
  const tagsData = await Promise.all(tags?.map(async (t: PostsTagsData) => {
    return {id: t.tag, title: await tagService.getTagName(t.tag)}
  }) || []);
  const postsCategoriesData = await postsCategoriesService.getCategoryForPost(postData.contentItemId);
  const category = postsCategoriesData?.category? await categoryService.getById(postsCategoriesData.category) : null;
  const likes = await reactionService.getReactionsCountForContentItem('like', postData.contentItemId);
  const dislikes = await reactionService.getReactionsCountForContentItem('dislike', postData.contentItemId);
  const comments = await commentService.getCommentsForPost(postData.contentItemId);

  const commentsData = await Promise.all(
    comments?.map(async (comment: CommentData) => {
      const itemData = await contentItemService.getById(comment.contentItemId);
      if (!itemData) {return {
        ...comment,
        children: []
      }}
      const author = await userService.getById(itemData.author);
      return {
        ...comment,
        author,
        children: []
      };
    })
  );

  const commentsMap = new Map<number, typeof commentsData[0]>();

  commentsData.forEach(c => commentsMap.set(c.contentItemId, c));

  const commentTree: typeof commentsData = [];

  commentsMap.forEach(comment => {
    if (comment.target === postData.contentItemId) {
      commentTree.push(comment);
    } else {
      const parent = commentsMap.get(comment.target);
      if (parent) parent.children.push(comment);
    }
  });

  const commentsToSend = Array.from(commentsMap.values()).filter(
    comment => comment.target === postData.contentItemId
  );

  console.log("comments: ", commentsToSend);

  const post = {
    id: postData.contentItemId,
    author: {
      id: authorData.id,
      login: authorData.login,
      profilePicture: authorData.profilePicture
    },
    title: postData.title,
    content: postData.content,
    status: postData.status,
    tags: tagsData,
    category: category,
    likes: likes,
    dislikes: dislikes,
    isLiked: await reactionService.getReaction(userId, postData.contentItemId, 'like'),
    isDisliked: await reactionService.getReaction(userId, postData.contentItemId, 'dislike'),
    comments: commentsToSend,
    views: postData.views,
    isSaved: await savedPostService.isSaved(userId, postData.contentItemId)
  }
  res.status(200).json({post: post});

}

export const getPostComments = async (req: Request, res: Response) => {
  const params = req.params;
  const postId = Number(params.postId);

  const comments = await commentService.getCommentsForPost(postId);
  const commentsData = await Promise.all(
    comments?.map(async (comment: CommentData) => {
      const itemData = await contentItemService.getById(comment.contentItemId);
      if (!itemData) return {...comment, children: []}
      const author = await userService.getById(itemData.author);
      return {...comment, author, children: []};
    })
  );

  const commentsMap = new Map<number, typeof commentsData[0]>();

  commentsData.forEach(c => commentsMap.set(c.contentItemId, c));

  const commentTree: typeof commentsData = [];

  commentsMap.forEach(comment => {
    if (comment.target === postId) {
      commentTree.push(comment);
    } else {
      const parent = commentsMap.get(comment.target);
      if (parent) parent.children.push(comment);
    }
  });

  const commentsToSend = Array.from(commentsMap.values()).filter(comment => comment.target === postId);

  console.log("comments: ", commentsToSend);
  res.status(200).json({comments: commentsToSend});
}

export const addComment = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const params = req.params;
  const postId = Number(params.postId);
  const {target, comment} = req.body;

  console.log('add comment: ', req.body );

  const contentItemId = await contentItemService.createItem(userId, 1, 'comment');
  await commentService.addComment(contentItemId, postId, target, comment);
  const commentData = await commentService.getComment(contentItemId);
  const user = await userService.getById(userId);
  const { password_hash, ...safeUser } = user!;

  const result = {...commentData, children: [], author: safeUser};
  console.log(result);

  return res.status(200).json({comment: result})
}