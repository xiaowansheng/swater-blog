'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Play, Trash2, Settings, Loader2 } from 'lucide-react'

interface Connection {
  id: string
  name: string
  type: string
}

interface Migration {
  id: string
  name: string
  description?: string
  sourceTable: {
    tableName: string
    connection: Connection
  }
  targetTable: {
    tableName: string
    connection: Connection
  }
  enabled: boolean
  createdAt: string
}

export default function MigrationsPage() {
  const [migrations, setMigrations] = useState<Migration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMigrations()
  }, [])

  const fetchMigrations = async () => {
    try {
      const response = await fetch('/api/migrations')
      const data = await response.json()
      setMigrations(data)
    } catch (error) {
      console.error('Failed to fetch migrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMigration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this migration?')) {
      return
    }

    try {
      await fetch(`/api/migrations/${id}`, {
        method: 'DELETE',
      })
      fetchMigrations()
    } catch (error) {
      console.error('Failed to delete migration:', error)
      alert('Failed to delete migration')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Migration Configurations</h1>
            <p className="text-gray-600 mt-1">Configure and manage data migrations</p>
          </div>
          <Link
            href="/migrations/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Migration
          </Link>
        </div>

        {migrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No migrations configured</h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first migration configuration
            </p>
            <Link
              href="/migrations/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Migration
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {migrations.map((migration) => (
              <div
                key={migration.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {migration.name}
                      </h3>
                      {migration.enabled && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Enabled
                        </span>
                      )}
                    </div>
                    {migration.description && (
                      <p className="text-gray-600 mb-4">{migration.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-medium text-green-900 mb-1">Source</p>
                        <p className="text-green-700">
                          {migration.sourceTable.connection.name} → {migration.sourceTable.tableName}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-900 mb-1">Target</p>
                        <p className="text-blue-700">
                          {migration.targetTable.connection.name} → {migration.targetTable.tableName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/migrations/${migration.id}/run`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Run Migration"
                    >
                      <Play className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/migrations/${migration.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deleteMigration(migration.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
