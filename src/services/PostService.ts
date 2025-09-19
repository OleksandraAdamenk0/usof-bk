import { RowDataPacket } from "mysql2/promise";
import { BaseService } from "./BaseService.js";

export interface PostData extends RowDataPacket {
  contentItemId: number;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  acceptedComment: number;
  views: number;
}

export class PostService extends BaseService<PostData> {
  private static instance: PostService;

  constructor() {super("post");}

  public static getInstance(): PostService {
    if (!PostService.instance) PostService.instance = new PostService();
    return PostService.instance;
  }

  async getPostsCount(): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM post WHERE status != 'draft';`
    );
    return (rows[0] as any)?.count ?? 0;
  }

  async toggleSavePost(userId: number, postId: number): Promise<boolean> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT 1 FROM savedPost WHERE user = ? AND post = ? LIMIT 1`,
      [userId, postId]
    );

    if (rows.length > 0) {
      await this.pool.query(
        `DELETE FROM savedPost WHERE user = ? AND post = ?`,
        [userId, postId]
      );
      return false;
    } else {
      await this.pool.query(
        `INSERT INTO savedPost (user, post) VALUES (?, ?)`,
        [userId, postId]
      );
      return true;
    }
  }

  async getTitle(id: number): Promise<string> {
    const rows = await this.query(`SELECT title FROM ${this.table} WHERE contentItemId = ?`, [id]);
    return rows[0]?.title ?? null;
  }

  async getPosts(userId: number, offset: number, size: number): Promise<PostData[] | null> {
    console.log('getPosts: ', userId);
    const [rows] = await this.pool.query<PostData[]>(
      `SELECT
           p.contentItemId,
           p.title,
           CASE
               WHEN CHAR_LENGTH(p.content) > 400
                   THEN CONCAT(SUBSTRING(p.content, 1, 400), '...')
               ELSE p.content
               END AS content,
           p.status,
           p.views,
           p.acceptedComment,
           ci.workspace,
           (SELECT c2.title
            FROM postsCategories pc2
                     JOIN category c2 ON pc2.category = c2.id
            WHERE pc2.post = p.contentItemId
            LIMIT 1) AS category,
           u.id AS userId,
           u.login,
           u.profilePicture,
           COALESCE(
                   JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'title', t.title)),
                   JSON_ARRAY()
           ) AS tags,
           EXISTS(
               SELECT 1
               FROM savedPost sp
               WHERE sp.user = ?
                 AND sp.post = p.contentItemId
           ) AS isSaved
       FROM post p
                JOIN contentItem ci ON p.contentItemId = ci.id
                JOIN user u ON ci.author = u.id
                LEFT JOIN postsTags pt ON p.contentItemId = pt.post
                LEFT JOIN tag t ON pt.tag = t.id
       GROUP BY p.contentItemId, p.title, p.content, p.status, p.views, p.acceptedComment,
                ci.workspace, u.id, u.login, u.profilePicture
       ORDER BY p.contentItemId DESC
       LIMIT ? OFFSET ?;`,
      [userId, size, offset]
    );

    return rows.length ? rows : null;
  }

  async getPost(postId: number): Promise<PostData | null> {
    const [rows] = await this.query(`SELECT * FROM ${this.table} WHERE contentItemId = ?`, [postId]);
    return rows ? rows : null;
  }
}
