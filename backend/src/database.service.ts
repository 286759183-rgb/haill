import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type DatabaseMode = 'memory' | 'mysql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool?: Pool;
  readonly mode: DatabaseMode;

  constructor() {
    this.mode = this.hasMysqlConfig() ? 'mysql' : 'memory';
  }

  private hasMysqlConfig() {
    return Boolean(process.env.DATABASE_URL || process.env.MYSQL_HOST || process.env.DB_HOST);
  }

  async onModuleInit() {
    if (this.mode !== 'mysql') return;

    if (process.env.DATABASE_URL) {
      this.pool = mysql.createPool(process.env.DATABASE_URL);
    } else {
      const options: PoolOptions = {
        host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
        user: process.env.MYSQL_USER || process.env.DB_USER || 'haill',
        password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'haill_password',
        database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'haill',
        waitForConnections: true,
        connectionLimit: 10,
      };
      this.pool = mysql.createPool(options);
    }

    await this.pool.query('SELECT 1');
    await this.ensureSchema();
    await this.ensureUserPasswordColumn();
    this.logger.log('MySQL database connected');
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  get ready() {
    return this.mode === 'memory' || Boolean(this.pool);
  }

  async query<T extends RowDataPacket[] | ResultSetHeader>(sql: string, params: unknown[] = []) {
    if (!this.pool) throw new Error('MySQL pool is not initialized');
    const [rows] = await this.pool.query<T>(sql, params);
    return rows;
  }

  private async ensureUserPasswordColumn() {
    const databaseName = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'haill';
    const rows = await this.query<RowDataPacket[]>(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [databaseName, 'users', 'password_hash'],
    );
    if (!rows.length) {
      await this.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(128) NULL AFTER phone');
    }
  }

  private async ensureSchema() {
    const candidates = [
      resolve(process.cwd(), '../database/schema.sql'),
      resolve(process.cwd(), 'database/schema.sql'),
      resolve(__dirname, '../../database/schema.sql'),
    ];
    const schemaPath = candidates.find(existsSync);
    if (!schemaPath) {
      this.logger.warn('database/schema.sql not found, skipping schema initialization');
      return;
    }
    const schema = readFileSync(schemaPath, 'utf8')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(Boolean);
    for (const stmt of schema) {
      await this.query(stmt);
    }
  }
}
