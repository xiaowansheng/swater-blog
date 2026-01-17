import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const migrationId = searchParams.get('migrationId')

    const where = migrationId ? { configId: migrationId } : {}

    const tasks = await prisma.migrationTask.findMany({
      where,
      include: {
        config: {
          include: {
            sourceTable: true,
            targetTable: true,
            mapping: {
              include: {
                fieldMappings: true,
              },
            },
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { migrationId } = body

    const task = await prisma.migrationTask.create({
      data: {
        configId: migrationId,
        status: 'pending',
      },
      include: {
        config: {
          include: {
            sourceTable: {
              include: {
                connection: true,
              },
            },
            targetTable: {
              include: {
                connection: true,
              },
            },
            mapping: {
              include: {
                fieldMappings: true,
              },
            },
          },
        },
      },
    })

    // Start migration in background
    const { startMigration } = await import('@/lib/migration/executor')
    startMigration(task.id, {
      sourceConnection: task.config.sourceTable.connection,
      targetConnection: task.config.targetTable.connection,
      sourceTable: task.config.sourceTable.tableName,
      targetTable: task.config.targetTable.tableName,
      fieldMappings: task.config.mapping.fieldMappings,
      batchSize: task.config.mapping.batchSize || 1000,
      deleteBeforeInsert: task.config.mapping.deleteBeforeInsert || false,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
