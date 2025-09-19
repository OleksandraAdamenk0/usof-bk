import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface CategoryData extends RowDataPacket {
  id: number;
  workspace: number;
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
}