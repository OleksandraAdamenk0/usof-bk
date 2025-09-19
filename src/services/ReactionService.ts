import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface ReactionData extends RowDataPacket {
  id: number;
  user: number;
  contentItemId: number;
  type: "like" | "dislike" | "love" | "laugh" | "angry";
  createdAt: Date;
}

export class ReactionService extends BaseService<ReactionData> {
  private static instance: ReactionService;
  constructor() {super("reaction")}

  public static getInstance() {
    if (!ReactionService.instance) ReactionService.instance = new ReactionService();
    return ReactionService.instance;
  }

  async getReactionsCountForContentItem(type: "like" | "dislike" | "love" | "laugh" | "angry", contentItemId: number) {
    const rows = await this.query(`SELECT COUNT(*) AS count FROM ${this.table} WHERE type = ? AND contentItemId = ?`, [type, contentItemId]);
    return rows[0].count as number;
  }

  async toggleReaction(userId: number, postId: number, reactionType: "like" | "dislike" | "love" | "laugh" | "angry") {
    const rows = await this.query(`SELECT 1 FROM ${this.table} WHERE user = ? AND contentItemId = ? AND type = ? LIMIT 1`, [userId, postId, reactionType]);

    console.log(rows.length);
    if (rows.length > 0) {
      await this.query(`DELETE FROM ${this.table} WHERE user = ? AND contentItemId = ? AND type = ?`, [userId, postId, reactionType]);
      return false;
    } else {
      await this.query(`INSERT INTO ${this.table} (user, contentItemId, type) VALUES (?, ?, ?)`, [userId, postId, reactionType]);
      return true;
    }
  }

  async getReaction(userId: number, postId: number, reactionType: "like" | "dislike" | "love" | "laugh" | "angry") {
    const rows = await this.query(`SELECT 1 FROM ${this.table} WHERE user = ? AND contentItemId = ? AND type = ? LIMIT 1`, [userId, postId, reactionType]);
    return Boolean(rows.length);
  }

  async getReactionCount(postId: number, reactionType: "like" | "dislike" | "love" | "laugh" | "angry") {
    const rows = await this.query(`SELECT COUNT(*) as count FROM ${this.table} WHERE contentItemId = ? AND type = ?`, [postId, reactionType]);
    console.log(rows)
    return rows[0].count;
  }
}