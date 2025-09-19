import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface PostsTagsData extends RowDataPacket{
  post: number;
  tag: number;
}

export class PostsTagsService extends BaseService<PostsTagsData>{
  private static instance: PostsTagsService;
  constructor() {super("postsTags")}

  public static getInstance() {
    if (!PostsTagsService.instance) PostsTagsService.instance = new PostsTagsService();
    return PostsTagsService.instance;
  }

  async getTagsForPost(postId: number): Promise<PostsTagsData[] | undefined> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE post=?`, [postId]);
    return rows;
  }
}