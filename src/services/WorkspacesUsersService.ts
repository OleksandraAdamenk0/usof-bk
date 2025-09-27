import {BaseService} from "./BaseService.js";
import {RowDataPacket} from "mysql2/promise";

export interface WorkspacesUsersData extends RowDataPacket{
  workspace: number;
  user: number;
  role: 'admin' | 'user';
  rating: number;
  createdAt: Date;
}

export class WorkspacesUsersService extends BaseService<WorkspacesUsersData>{
  private static instance: WorkspacesUsersService;
  constructor() {super("workspacesUsers")}

  public static getInstance() {
    if (!WorkspacesUsersService.instance) WorkspacesUsersService.instance = new WorkspacesUsersService();
    return WorkspacesUsersService.instance;
  }

  async getForWorkspace(workspaceId: number): Promise<WorkspacesUsersData[] | undefined> {
    return await this.query(`SELECT * FROM ${this.table} WHERE workspace=?`, [workspaceId]);
  }
}