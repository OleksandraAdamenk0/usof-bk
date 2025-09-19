import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface CommentData extends RowDataPacket {
  contentItemId: number;
  post: number;
  target: number;
  content: string;
}

export class CommentService extends BaseService<CommentData>{
  private static instance: CommentService;
  constructor() {super("comment")}

  public static getInstance() {
    if (!CommentService.instance) CommentService.instance = new CommentService();
    return CommentService.instance;
  }

  async getCommentsForPost(postId: number): Promise<CommentData | undefined> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE post = ?`, [postId]);
    return rows;
  }

  async getCommentsCount(postId: number): Promise<number> {
    const rows = await this.query(`SELECT COUNT(*) as count FROM ${this.table} WHERE post = ?`, [postId]);
    return rows[0].count;
  }

  async addComment(itemId: number, postId: number, target: number, comment: Comment) {
    const rows = await this.query(`INSERT INTO ${this.table} (contentItemId, post, target, content) VALUES (?, ?, ?, ?)`, [itemId, postId, target, comment]);
    return rows;
  }

  async getComment(itemId: number): Promise<CommentData> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE contentItemId = ?`, [itemId]);
    return rows[0];
  }
}