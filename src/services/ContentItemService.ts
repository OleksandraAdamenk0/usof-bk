import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";
import {PostData} from "./PostService";

export interface ContentItem extends RowDataPacket {
  id: number;
  author: number;
  workspace: number;
  type: 'post' | 'comment';
  createdAt: Date;
  updatedAt: Date;
}

export class ContentItemService extends BaseService<ContentItem> {
  private static instance: ContentItemService;
  constructor() { super("contentItem"); }

  public static getInstance(): ContentItemService {
    if (!ContentItemService.instance) ContentItemService.instance = new ContentItemService();
    return ContentItemService.instance;
  }

  async createItem(userId: number, workspace: number, type: "post" | "comment"): Promise<number> {
    const rows = await this.query(`INSERT INTO ${this.table} (author, workspace, type) VALUES (?, ?, ?)`, [userId, workspace, type]);
    return rows.insertId;
  }

  async getRecent(id: number, amount: number): Promise<PostData[]> {
    const rows = this.query(`SELECT * FROM ${this.table} WHERE author = ? AND type="post" ORDER BY createdAt DESC LIMIT ?;`, [id, amount]);
    console.log('getRecent', rows);
    return rows;
  }
}