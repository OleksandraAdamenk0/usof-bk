import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface SavedPostData extends RowDataPacket  {
  post: number;
  user: number;
  createdAt: Date;
}

export class SavedPostService extends BaseService<SavedPostData> {
  private static instance: SavedPostService;
  constructor() {super('savedPost')}

  public static getInstance(): SavedPostService {
    if (!SavedPostService.instance) SavedPostService.instance = new SavedPostService();
    return SavedPostService.instance;
  }

  async isSaved(userId: number, postId: number): Promise<boolean> {
    const rows = await this.query(`SELECT 1 FROM ${this.table} WHERE post = ? AND user = ?;`, [postId, userId]);
    console.log("Rows -> ", rows);
    return rows.length > 0;
  }
}