import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';

const useSqlite = process.env.DB_CLIENT !== 'mysql';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqliteDb = new Database(path.join(dbDir, 'manga-store.db'));
sqliteDb.pragma('journal_mode = WAL');

const mysqlPool = useSqlite
  ? null
  : mysql.createPool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'aula1',
    });

function normalizeParams(params?: unknown[]) {
  return Array.isArray(params)
    ? params.map((value) => (typeof value === 'boolean' ? (value ? 1 : 0) : value))
    : [];
}

function runSqlite(sql: string, params?: unknown[]) {
  const normalizedSql = sql.trim().toLowerCase();
  const values = normalizeParams(params);

  if (normalizedSql.startsWith('select')) {
    const statement = sqliteDb.prepare(sql);
    return [statement.all(...values), undefined] as const;
  }

  if (normalizedSql.startsWith('create') || normalizedSql.startsWith('pragma') || normalizedSql.startsWith('drop')) {
    sqliteDb.exec(sql);
    return [{ affectedRows: 0, insertId: 0 }, undefined] as const;
  }

  const statement = sqliteDb.prepare(sql);
  const info = statement.run(...values);

  return [{ affectedRows: info.changes, insertId: info.lastInsertRowid }, undefined] as const;
}

const connection = {
  isSqlite: useSqlite,
  async execute<T = unknown>(sql: string, params?: unknown[]) {
    if (mysqlPool) {
      try {
        return await mysqlPool.execute<T>(sql, params ?? []);
      } catch (error) {
        console.warn('Falling back to SQLite because MySQL is unavailable.', error);
      }
    }

    return runSqlite(sql, params) as [T, undefined];
  },
};

export default connection;