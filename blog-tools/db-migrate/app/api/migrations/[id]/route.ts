import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const migration = await prisma.migrationConfig.findUnique({
      where: { id: params.id },
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
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!migration) {
      return NextResponse.json({ error: 'Migration not found' }, { status: 404 })
    }

    return NextResponse.json(migration)
  } catch (error) {
    console.error('Failed to fetch migration:', error)
    return NextResponse.json({ error: 'Failed to fetch migration' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.migrationConfig.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete migration:', error)
    return NextResponse.json({ error: 'Failed to delete migration' }, { status: 500 })
  }
}
