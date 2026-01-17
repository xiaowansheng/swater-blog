export interface DatabaseConnection {
  id?: string
  name: string
  type: 'mysql' | 'postgresql' | 'sqlserver' | 'oracle'
  host: string
  port: number
  username: string
  password: string
  database: string
  isSource?: boolean
  isTarget?: boolean
}

export interface TableInfo {
  tableName: string
  schemaName?: string
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  defaultValue?: string
  maxLength?: number
}

export interface FieldMapping {
  id?: string
  sourceField: string
  targetField: string
  fieldType: string
  transformer?: string
  defaultValue?: string
  isPrimaryKey: boolean
}

export interface TableMapping {
  id?: string
  sourceTable: string
  targetTable: string
  fieldMappings: FieldMapping[]
  deleteBeforeInsert?: boolean
  batchSize?: number
}

export interface MigrationConfig {
  id?: string
  name: string
  description?: string
  sourceConnectionId: string
  targetConnectionId: string
  mappings: TableMapping[]
  enabled?: boolean
}

export interface MigrationProgress {
  taskId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalRecords: number
  processedRecords: number
  failedRecords: number
  startTime?: Date
  endTime?: Date
  errorMessage?: string
  currentTable?: string
}
