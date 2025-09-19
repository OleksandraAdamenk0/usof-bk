import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface PostsCategoriesData extends RowDataPacket{
  category: number;
  post: number;
}

export class PostsCategoriesService extends BaseService<PostsCategoriesData>{
  private static instance: PostsCategoriesService;
  constructor() {super('postsCategories')}

  public static getInstance(): PostsCategoriesService {
    if (!PostsCategoriesService.instance) PostsCategoriesService.instance = new PostsCategoriesService();
    return PostsCategoriesService.instance;
  }

  async getCategoryForPost(id: number): Promise<PostsCategoriesData | undefined> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE post=?`, [id]);
    return rows? rows[0]: undefined;
  }
}