import mysql from 'mysql2/promise'
import pkg from 'pg';
const { Pool: PgPool } = pkg;

import type { DatabaseConnection, TableInfo, ColumnInfo } from '@/types/database'

export class DatabaseConnector {
  private connection: any = null
  private config: DatabaseConnection

  constructor(config: DatabaseConnection) {
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.config.type === 'mysql') {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
      })
    } else if (this.config.type === 'postgresql') {
      this.connection = new PgPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        max: 1,
      })
      await this.connection.connect()
    }
  }

  async disconnect(): Promise<void> {
    if (this.config.type === 'mysql' && this.connection) {
      await this.connection.end()
    } else if (this.config.type === 'postgresql' && this.connection) {
      await this.connection.end()
    }
    this.connection = null
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.query('SELECT 1')
      await this.disconnect()
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  async getTables(): Promise<string[]> {
    await this.connect()

    let tables: string[] = []

    if (this.config.type === 'mysql') {
      const [rows] = await this.connection.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = "BASE TABLE"',
        [this.config.database]
      )
      tables = (rows as any[]).map((row: any) => row.table_name)
    } else if (this.config.type === 'postgresql') {
      const result = await this.connection.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
      )
      tables = result.rows.map((row: any) => row.table_name)
    }

    await this.disconnect()
    return tables
  }

  async getTableInfo(tableName: string): Promise<TableInfo> {
    await this.connect()

    let columns: ColumnInfo[] = []

    if (this.config.type === 'mysql') {
      const [rows] = await this.connection.query(
        `SELECT
          column_name,
          data_type,
          is_nullable,
          column_key,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = ? AND table_name = ?
        ORDER BY ordinal_position`,
        [this.config.database, tableName]
      )
      columns = (rows as any[]).map((row: any) => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: row.column_key === 'PRI',
        defaultValue: row.column_default,
        maxLength: row.character_maximum_length,
      }))
    } else if (this.config.type === 'postgresql') {
      const result = await this.connection.query(
        `SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position`,
        [tableName]
      )

      // Get primary key info
      const pkResult = await this.connection.query(
        `SELECT a.attname
         FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass AND i.indisprimary`,
        [tableName]
      )
      const primaryKeys = pkResult.rows.map((row: any) => row.attname)

      columns = result.rows.map((row: any) => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: primaryKeys.includes(row.column_name),
        defaultValue: row.column_default,
        maxLength: row.character_maximum_length,
      }))
    }

    await this.disconnect()

    return {
      tableName,
      schemaName: this.config.type === 'postgresql' ? 'public' : this.config.database,
      columns,
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (this.config.type === 'mysql') {
      const [rows] = await this.connection.query(sql, params)
      return rows
    } else if (this.config.type === 'postgresql') {
      const result = await this.connection.query(sql, params)
      return result.rows
    }
    throw new Error('Unsupported database type')
  }

  async countRecords(tableName: string, where?: string): Promise<number> {
    await this.connect()

    let sql = `SELECT COUNT(*) as count FROM ${tableName}`
    if (where) {
      sql += ` WHERE ${where}`
    }

    const rows = await this.query(sql)
    await this.disconnect()

    return rows[0]?.count || 0
  }

  async getRecords(tableName: string, offset: number, limit: number, where?: string): Promise<any[]> {
    await this.connect()

    let sql = `SELECT * FROM ${tableName}`
    if (where) {
      sql += ` WHERE ${where}`
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`

    const records = await this.query(sql)
    await this.disconnect()

    return records
  }

  async insertRecords(tableName: string, records: any[]): Promise<void> {
    if (records.length === 0) return

    await this.connect()

    const columns = Object.keys(records[0])
    const placeholders = records.map((_, i) => {
      const start = i * columns.length
      const vals = columns.map((_, j) => {
        if (this.config.type === 'mysql') {
          return '?'
        } else {
          return `$${start + j + 1}`
        }
      })
      return `(${vals.join(', ')})`
    })

    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`

    const flatValues = records.flatMap((record) => columns.map((col) => record[col]))

    await this.query(sql, flatValues)
    await this.disconnect()
  }

  async deleteRecords(tableName: string, where?: string): Promise<void> {
    await this.connect()

    let sql = `DELETE FROM ${tableName}`
    if (where) {
      sql += ` WHERE ${where}`
    }

    await this.query(sql)
    await this.disconnect()
  }
}
