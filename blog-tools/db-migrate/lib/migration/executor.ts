import { DatabaseConnector } from '@/lib/db/connector'
import { prisma } from '@/lib/db'
import type { FieldMapping } from '@/types/database'

export interface MigrationOptions {
  sourceConnection: any
  targetConnection: any
  sourceTable: string
  targetTable: string
  fieldMappings: FieldMapping[]
  batchSize: number
  deleteBeforeInsert: boolean
  onProgress?: (progress: MigrationProgress) => void
  onLog?: (level: string, message: string, data?: any) => void
}

export interface MigrationProgress {
  totalRecords: number
  processedRecords: number
  failedRecords: number
  status: string
  currentBatch: number
  totalBatches: number
}

export class MigrationExecutor {
  private sourceConnector: DatabaseConnector
  private targetConnector: DatabaseConnector
  private options: MigrationOptions
  private taskId: string
  private isCancelled = false

  constructor(taskId: string, options: MigrationOptions) {
    this.taskId = taskId
    this.options = options
    this.sourceConnector = new DatabaseConnector(options.sourceConnection)
    this.targetConnector = new DatabaseConnector(options.targetConnection)
  }

  async execute(): Promise<void> {
    try {
      await this.updateTaskStatus('running')
      this.log('info', 'Migration started')

      // Connect to both databases
      this.log('info', 'Connecting to source database')
      await this.sourceConnector.connect()

      this.log('info', 'Connecting to target database')
      await this.targetConnector.connect()

      // Get total record count
      this.log('info', `Counting records in ${this.options.sourceTable}`)
      const totalRecords = await this.sourceConnector.countRecords(
        this.options.sourceTable
      )

      this.log('info', `Found ${totalRecords} records to migrate`)

      // Delete existing records if requested
      if (this.options.deleteBeforeInsert) {
        this.log('info', `Deleting existing records from ${this.options.targetTable}`)
        await this.targetConnector.deleteRecords(this.options.targetTable)
      }

      // Calculate batches
      const totalBatches = Math.ceil(totalRecords / this.options.batchSize)

      // Process records in batches
      let processedRecords = 0
      let failedRecords = 0

      for (let batch = 0; batch < totalBatches; batch++) {
        if (this.isCancelled) {
          this.log('warning', 'Migration cancelled by user')
          await this.updateTaskStatus('cancelled')
          return
        }

        const offset = batch * this.options.batchSize
        const limit = Math.min(this.options.batchSize, totalRecords - offset)

        this.log('info', `Processing batch ${batch + 1}/${totalBatches}`)

        try {
          // Fetch records from source
          const records = await this.sourceConnector.getRecords(
            this.options.sourceTable,
            offset,
            limit
          )

          // Transform and insert records
          const transformedRecords = records.map((record) =>
            this.transformRecord(record)
          )

          await this.targetConnector.insertRecords(
            this.options.targetTable,
            transformedRecords
          )

          processedRecords += records.length

          // Update progress
          await this.updateProgress({
            totalRecords,
            processedRecords,
            failedRecords,
            status: 'running',
            currentBatch: batch + 1,
            totalBatches,
          })

          this.log(
            'info',
            `Batch ${batch + 1}/${totalBatches} completed (${processedRecords}/${totalRecords} records)`
          )
        } catch (error: any) {
          failedRecords += limit
          this.log('error', `Batch ${batch + 1} failed: ${error.message}`)

          await this.updateProgress({
            totalRecords,
            processedRecords,
            failedRecords,
            status: 'running',
            currentBatch: batch + 1,
            totalBatches,
          })
        }
      }

      // Disconnect
      await this.sourceConnector.disconnect()
      await this.targetConnector.disconnect()

      // Mark as completed
      await this.updateTaskStatus('completed')
      await this.updateProgress({
        totalRecords,
        processedRecords,
        failedRecords,
        status: 'completed',
        currentBatch: totalBatches,
        totalBatches,
      })

      this.log('info', `Migration completed successfully. Processed: ${processedRecords}, Failed: ${failedRecords}`)
    } catch (error: any) {
      this.log('error', `Migration failed: ${error.message}`)
      await this.updateTaskStatus('failed', error.message)
      throw error
    }
  }

  transformRecord(record: any): any {
    const transformed: any = {}

    for (const mapping of this.options.fieldMappings) {
      const sourceValue = record[mapping.sourceField]

      if (sourceValue !== null && sourceValue !== undefined) {
        transformed[mapping.targetField] = this.applyTransformer(
          sourceValue,
          mapping.transformer
        )
      } else if (mapping.defaultValue) {
        transformed[mapping.targetField] = mapping.defaultValue
      }
    }

    return transformed
  }

  applyTransformer(value: any, transformer?: string): any {
    if (!transformer) return value

    try {
      // Built-in transformers
      switch (transformer) {
        case 'toString':
          return String(value)
        case 'toNumber':
          return Number(value)
        case 'toBoolean':
          return Boolean(value)
        case 'toUpperCase':
          return String(value).toUpperCase()
        case 'toLowerCase':
          return String(value).toLowerCase()
        case 'trim':
          return String(value).trim()
        case 'toDate':
          return new Date(value)
        default:
          // Try to evaluate as function (use with caution)
          const fn = new Function('value', `return ${transformer}`)
          return fn(value)
      }
    } catch (error) {
      console.error('Transformer error:', error)
      return value
    }
  }

  cancel(): void {
    this.isCancelled = true
  }

  private async updateTaskStatus(status: string, errorMessage?: string): Promise<void> {
    await prisma.migrationTask.update({
      where: { id: this.taskId },
      data: {
        status,
        errorMessage,
        ...(status === 'running' && { startTime: new Date() }),
        ...(status === 'completed' && { endTime: new Date() }),
        ...(status === 'failed' && { endTime: new Date() }),
        ...(status === 'cancelled' && { endTime: new Date() }),
      },
    })
  }

  private async updateProgress(progress: MigrationProgress): Promise<void> {
    await prisma.migrationTask.update({
      where: { id: this.taskId },
      data: {
        totalRecords: progress.totalRecords,
        processedRecords: progress.processedRecords,
        failedRecords: progress.failedRecords,
      },
    })

    if (this.options.onProgress) {
      this.options.onProgress(progress)
    }
  }

  private log(level: string, message: string, data?: any): void {
    prisma.migrationLog
      .create({
        data: {
          taskId: this.taskId,
          level,
          message,
          data: data ? JSON.stringify(data) : null,
        },
      })
      .catch((error) => console.error('Failed to create log:', error))

    if (this.options.onLog) {
      this.options.onLog(level, message, data)
    }
  }
}

// Map to store running migrations
const runningMigrations = new Map<string, MigrationExecutor>()

export function startMigration(taskId: string, options: MigrationOptions): void {
  const executor = new MigrationExecutor(taskId, options)
  runningMigrations.set(taskId, executor)

  executor.execute().finally(() => {
    runningMigrations.delete(taskId)
  })
}

export function cancelMigration(taskId: string): boolean {
  const executor = runningMigrations.get(taskId)
  if (executor) {
    executor.cancel()
    return true
  }
  return false
}
