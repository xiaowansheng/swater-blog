import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
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

    return NextResponse.json(connection)
  } catch (error) {
    console.error('Failed to fetch connection:', error)
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, type, host, port, username, password, database, isSource, isTarget } = body

    const connection = await prisma.databaseConnection.update({
      where: { id: params.id },
      data: {
        name,
        type,
        host,
        port,
        username,
        password,
        database,
        isSource,
        isTarget,
      },
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error('Failed to update connection:', error)
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.databaseConnection.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}
