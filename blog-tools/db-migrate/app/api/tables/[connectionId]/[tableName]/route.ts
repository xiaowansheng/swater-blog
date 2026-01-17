import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DatabaseConnector } from '@/lib/db/connector'

export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string; tableName: string } }
) {
  try {
    const connection = await prisma.databaseConnection.findUnique({
      where: { id: params.connectionId },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const connector = new DatabaseConnector({
      name: connection.name,
      type: connection.type as any,
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: connection.password,
      database: connection.database,
    })

    const tableInfo = await connector.getTableInfo(params.tableName)

    return NextResponse.json(tableInfo)
  } catch (error) {
    console.error('Failed to fetch table info:', error)
    return NextResponse.json({ error: 'Failed to fetch table info' }, { status: 500 })
  }
}
