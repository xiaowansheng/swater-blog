'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Connection {
  id: string
  name: string
  type: string
  host: string
  port: number
  database: string
  isSource: boolean
  isTarget: boolean
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections')
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (id: string) => {
    setTesting(id)
    try {
      const response = await fetch(`/api/connections/${id}/test`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        alert('Connection successful!')
      } else {
        alert('Connection failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Connection failed: ' + error)
    } finally {
      setTesting(null)
    }
  }

  const deleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return
    }

    try {
      await fetch(`/api/connections/${id}`, {
        method: 'DELETE',
      })
      fetchConnections()
    } catch (error) {
      console.error('Failed to delete connection:', error)
      alert('Failed to delete connection')
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
            <h1 className="text-3xl font-bold text-gray-900">Database Connections</h1>
            <p className="text-gray-600 mt-1">Manage your database connections</p>
          </div>
          <Link
            href="/connections/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Connection
          </Link>
        </div>

        {connections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No connections yet</h2>
            <p className="text-gray-600 mb-6">
              Get started by adding your first database connection
            </p>
            <Link
              href="/connections/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Connection
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {connection.name}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {connection.type}
                      </span>
                      {connection.isSource && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Source
                        </span>
                      )}
                      {connection.isTarget && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          Target
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Host:</span> {connection.host}
                      </p>
                      <p>
                        <span className="font-medium">Port:</span> {connection.port}
                      </p>
                      <p>
                        <span className="font-medium">Database:</span> {connection.database}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testConnection(connection.id)}
                      disabled={testing === connection.id}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Test Connection"
                    >
                      {testing === connection.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </button>
                    <Link
                      href={`/connections/${connection.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deleteConnection(connection.id)}
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
