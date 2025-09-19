import mysql, {RowDataPacket, ResultSetHeader} from "mysql2/promise";
import {pool as connection} from "../db/connection.js";

export class BaseService<T extends RowDataPacket> {
  protected readonly table: string;
  protected pool: mysql.Pool;

  constructor(tableName: string) {
    this.table = tableName;
    this.pool = connection;
  }

  async getAll(): Promise<T[]> {
    const [rows] = await this.pool.query<T[]>(`SELECT * FROM \`${this.table}\``);
    return rows;
  }

  async getById(id: number): Promise<T | null> {
    const [rows] = await this.pool.query<T[]>(`SELECT * FROM \`${this.table}\` WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  async deleteById(id: number): Promise<number> {
    const [result] = await this.pool.query(`DELETE FROM \`${this.table}\` WHERE id = ?`, [id]);
    return (result as any).affectedRows;
  }

  async insert(data: { [key: string]: string | number | null}): Promise<number> {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => "?").join(", ");
    const values = Object.values(data);

    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO \`${this.table}\` (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );
    return result.insertId!;
  }

  async update(id: number, data: Partial<T>): Promise<number> {
    const fields = Object.keys(data);
    const setClause = fields.map(f => `\`${f}\` = ?`).join(", ");
    const values = Object.values(data);

    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE \`${this.table}\` SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return result.affectedRows || 0;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
}