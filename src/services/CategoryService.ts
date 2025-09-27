import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";
import {UserData} from "./UserService";

export interface CategoryData extends RowDataPacket {
  id: number;
  workspace: number | string;
  title: string;
  description: string;
}

export class CategoryService extends BaseService<CategoryData>{
  private static interface: CategoryService;
  constructor() {super("category")}

  public static getInstance() {
    if (!CategoryService.interface) CategoryService.interface = new CategoryService();
    return CategoryService.interface;
  }

  async findByTitle(title: string): Promise<CategoryData> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE title=?`, [title]);
    console.log(rows);
    return (rows[0] as CategoryData) || null
  }

  async create(categoryData: CategoryData): Promise<number> {
    const columns = Object.keys(categoryData).join(", ");
    const placeholders = Object.keys(categoryData).map(() => "?").join(", ");
    const values = Object.values(categoryData);

    const result =  await this.query(`INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`, values);
    return result.insertId || null;
  }
}