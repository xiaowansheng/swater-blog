import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DatabaseConnector } from '@/lib/db/connector'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await prisma.databaseConnection.findUnique({
      where: { id: params.id },
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

    const success = await connector.testConnection()

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Failed to test connection:', error)
    return NextResponse.json({ success: false, error: 'Connection test failed' }, { status: 500 })
  }
}
