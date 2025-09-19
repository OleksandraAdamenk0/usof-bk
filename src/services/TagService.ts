import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface TagData extends RowDataPacket  {
  id: number;
  workspace: number;
  author: number;
  title: string;
}

export class TagService extends BaseService<TagData> {
  private static instance: TagService;
  constructor() {super('tag')}

  public static getInstance(): TagService {
    if (!TagService.instance) TagService.instance = new TagService();
    return TagService.instance;
  }

  async getTagName(id: number): Promise<string | undefined> {
    const [rows] = await this.query(`SELECT title FROM ${this.table} WHERE id = ?;`, [id]);
    return rows? rows.title : undefined;
  }
}