import {RowDataPacket} from "mysql2/promise";
import {BaseService} from "./BaseService.js";

export interface UserData extends RowDataPacket {
  id: number;
  email: string;
  login: string;
  fullName: string;
  profilePicture: string;
  status: string;
  github: string;
  linkedin: string;
  password_hash: string;
  is_verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService extends BaseService<UserData> {
  private static instance: UserService;
  constructor() { super("user");}

  public static getInstance(): UserService {
    if (!UserService.instance) UserService.instance = new UserService();
    return UserService.instance;
  }

  async findByEmail(email: string): Promise<UserData> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${this.table}\` WHERE email = ?`,
      [email]
    );
    return (rows[0] as UserData) || null;
  }

  async findByLogin(login: string): Promise<UserData> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${this.table}\` WHERE login = ?`,
      [login]
    );
    return (rows[0] as UserData) || null;
  }

  async findByLoginEmail(login: string, email: string): Promise<UserData | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${this.table}\` WHERE login = ? AND email = ?`,
      [login, email]
    );
    return (rows[0] as UserData) || null;
  }

  async verifyEmail(id: number): Promise<UserData> {
    await this.query(`UPDATE ${this.table} SET is_verified = true WHERE id = ?`, [id]);

    const [user] = await this.query(
      `SELECT id, login, email, fullName, is_verified FROM ${this.table} WHERE id = ?`,
      [id]
    );
    return user;
  }

  async getSocial(id: number) {
    const rows = await this.query(`SELECT github, linkedin FROM ${this.table} WHERE id = ?`, [id]);
    return rows[0];
  }

  async updateLogin(id: number, login: string): Promise<void> {
    await this.query(`UPDATE ${this.table} SET login = ? WHERE id = ?`, [login, id])
  }

  async updateEmail(id: number, email: string): Promise<void> {
    await this.query(`UPDATE ${this.table} SET email = ? WHERE id = ?`, [email, id]);
  }

  async updateFullName(id: number, fullName: string): Promise<void> {
    await this.query(`UPDATE ${this.table} SET fullName = ? WHERE id = ?`, [id]);
  }

  async updateGitHub(id: number, gitHub: string): Promise<void> {
    await this.query(`UPDATE ${this.table} SET github = ? WHERE id = ?`, [gitHub, id]);
  }

  async updateLinkedin(id: number, linkedin: string): Promise<void> {
    await this.query(`UPDATE ${this.table} SET linkedin = ? WHERE id = ?`, [linkedin,id]);
  }
}