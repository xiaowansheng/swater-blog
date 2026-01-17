import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DatabaseConnector } from '@/lib/db/connector'

export async function GET() {
  try {
    const connections = await prisma.databaseConnection.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(connections)
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, host, port, username, password, database, isSource, isTarget } = body

    const connection = await prisma.databaseConnection.create({
      data: {
        name,
        type,
        host,
        port,
        username,
        password,
        database,
        isSource: isSource || false,
        isTarget: isTarget || false,
      },
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error('Failed to create connection:', error)
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
  }
}
