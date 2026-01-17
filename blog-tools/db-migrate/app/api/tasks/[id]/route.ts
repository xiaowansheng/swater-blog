import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.migrationTask.findUnique({
      where: { id: params.id },
      include: {
        config: {
          include: {
            sourceTable: true,
            targetTable: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'cancel') {
      // Cancel the running migration
      const { cancelMigration } = await import('@/lib/migration/executor')
      const cancelled = cancelMigration(params.id)

      if (!cancelled) {
        return NextResponse.json({ error: 'Task is not running' }, { status: 400 })
      }

      const task = await prisma.migrationTask.update({
        where: { id: params.id },
        data: {
          status: 'cancelled',
          endTime: new Date(),
        },
      })

      return NextResponse.json(task)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
