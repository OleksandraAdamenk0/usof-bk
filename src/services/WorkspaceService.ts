import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface WorkspaceData extends RowDataPacket {
  id: number;
  name: number;
  description: string;
  owner: number;
  created_at: Date;
  updated_at: Date;
}

export class WorkspaceService extends BaseService<WorkspaceData>{
  private static interface: WorkspaceService;
  constructor() {super("workspace")}

  public static getInstance() {
    if (!WorkspaceService.interface) WorkspaceService.interface = new WorkspaceService();
    return WorkspaceService.interface;
  }

  async findByName(name: string): Promise<WorkspaceData> {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE name=?`, [name]);
    return (rows[0] as WorkspaceData) || null
  }
}