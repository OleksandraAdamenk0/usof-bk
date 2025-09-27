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


  async findByTitle(title: string): Promise<TagData> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE title=?`, [title]);
    return (rows[0] as TagData) || null
  }

  async create(tagData: TagData): Promise<number> {
    const columns = Object.keys(tagData).join(", ");
    const placeholders = Object.keys(tagData).map(() => "?").join(", ");
    const values = Object.values(tagData);

    const result =  await this.query(`INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`, values);
    return result.insertId || null;
  }
}