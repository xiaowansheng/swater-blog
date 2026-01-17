import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const migrations = await prisma.migrationConfig.findMany({
      include: {
        sourceTable: true,
        targetTable: true,
        mapping: {
          include: {
            fieldMappings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(migrations)
  } catch (error) {
    console.error('Failed to fetch migrations:', error)
    return NextResponse.json({ error: 'Failed to fetch migrations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, sourceConnectionId, targetConnectionId, mappings } = body

    // Create source table config
    const sourceTable = await prisma.migrationSourceConfig.create({
      data: {
        connectionId: sourceConnectionId,
        tableName: mappings[0]?.sourceTable || '',
      },
    })

    // Create target table config
    const targetTable = await prisma.migrationTargetConfig.create({
      data: {
        connectionId: targetConnectionId,
        tableName: mappings[0]?.targetTable || '',
      },
    })

    // Create field mappings and table mapping
    const fieldMappings = await prisma.fieldMapping.createMany({
      data: mappings[0].fieldMappings.map((fm: any) => ({
        ...fm,
        mappingId: 'temp',
      })),
    })

    // Get the created field mappings
    const createdFieldMappings = await prisma.fieldMapping.findMany({
      where: {
        sourceField: {
          in: mappings[0].fieldMappings.map((fm: any) => fm.sourceField),
        },
      },
      take: mappings[0].fieldMappings.length,
      orderBy: { createdAt: 'desc' },
    })

    // Create table mapping
    const tableMapping = await prisma.tableMapping.create({
      data: {
        sourceTableId: sourceTable.id,
        targetTableId: targetTable.id,
        fieldMappings: {
          connect: createdFieldMappings.map((fm) => ({ id: fm.id })),
        },
        batchSize: mappings[0].batchSize || 1000,
        deleteBeforeInsert: mappings[0].deleteBeforeInsert || false,
      },
    })

    // Update field mappings with correct mappingId
    await prisma.fieldMapping.updateMany({
      where: {
        id: {
          in: createdFieldMappings.map((fm) => fm.id),
        },
      },
      data: {
        mappingId: tableMapping.id,
      },
    })

    // Create migration config
    const migration = await prisma.migrationConfig.create({
      data: {
        name,
        description,
        sourceTableId: sourceTable.id,
        targetTableId: targetTable.id,
        mappingId: tableMapping.id,
      },
      include: {
        sourceTable: true,
        targetTable: true,
        mapping: {
          include: {
            fieldMappings: true,
          },
        },
      },
    })

    return NextResponse.json(migration)
  } catch (error) {
    console.error('Failed to create migration:', error)
    return NextResponse.json({ error: 'Failed to create migration' }, { status: 500 })
  }
}
