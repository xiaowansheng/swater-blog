'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Connection {
  id: string
  name: string
  type: string
}

interface Table {
  name: string
}

interface Column {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
}

export default function NewMigrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [sourceTables, setSourceTables] = useState<string[]>([])
  const [targetTables, setTargetTables] = useState<string[]>([])
  const [sourceColumns, setSourceColumns] = useState<Column[]>([])
  const [targetColumns, setTargetColumns] = useState<Column[]>([])

  const [migration, setMigration] = useState({
    name: '',
    description: '',
    sourceConnectionId: '',
    targetConnectionId: '',
    sourceTable: '',
    targetTable: '',
    batchSize: 1000,
    deleteBeforeInsert: false,
    fieldMappings: [] as Array<{
      sourceField: string
      targetField: string
      fieldType: string
      isPrimaryKey: boolean
    }>,
  })

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
    }
  }

  const fetchTables = async (connectionId: string, isSource: boolean) => {
    try {
      const response = await fetch(`/api/tables/${connectionId}`)
      const data = await response.json()
      if (isSource) {
        setSourceTables(data)
      } else {
        setTargetTables(data)
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    }
  }

  const fetchColumns = async (connectionId: string, tableName: string, isSource: boolean) => {
    try {
      const response = await fetch(`/api/tables/${connectionId}/${tableName}`)
      const data = await response.json()
      if (isSource) {
        setSourceColumns(data.columns)
      } else {
        setTargetColumns(data.columns)
      }
    } catch (error) {
      console.error('Failed to fetch columns:', error)
    }
  }

  useEffect(() => {
    if (migration.sourceConnectionId) {
      fetchTables(migration.sourceConnectionId, true)
    }
  }, [migration.sourceConnectionId])

  useEffect(() => {
    if (migration.targetConnectionId) {
      fetchTables(migration.targetConnectionId, false)
    }
  }, [migration.targetConnectionId])

  useEffect(() => {
    if (migration.sourceConnectionId && migration.sourceTable) {
      fetchColumns(migration.sourceConnectionId, migration.sourceTable, true)
    }
  }, [migration.sourceConnectionId, migration.sourceTable])

  useEffect(() => {
    if (migration.targetConnectionId && migration.targetTable) {
      fetchColumns(migration.targetConnectionId, migration.targetTable, false)
    }
  }, [migration.targetConnectionId, migration.targetTable])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: migration.name,
          description: migration.description,
          sourceConnectionId: migration.sourceConnectionId,
          targetConnectionId: migration.targetConnectionId,
          mappings: [
            {
              sourceTable: migration.sourceTable,
              targetTable: migration.targetTable,
              fieldMappings: migration.fieldMappings,
              batchSize: migration.batchSize,
              deleteBeforeInsert: migration.deleteBeforeInsert,
            },
          ],
        }),
      })

      if (response.ok) {
        router.push('/migrations')
      } else {
        throw new Error('Failed to create migration')
      }
    } catch (error) {
      console.error('Failed to create migration:', error)
      alert('Failed to create migration')
    } finally {
      setLoading(false)
    }
  }

  const autoMapFields = () => {
    const mappings = sourceColumns
      .filter((sc) => targetColumns.some((tc) => tc.name === sc.name))
      .map((sc) => ({
        sourceField: sc.name,
        targetField: sc.name,
        fieldType: sc.type,
        isPrimaryKey: sc.primaryKey,
      }))

    setMigration((prev) => ({ ...prev, fieldMappings: mappings }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/migrations"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Migrations
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <ChevronRight className="w-6 h-6 mx-2 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basic Info</span>
              <span>Source</span>
              <span>Target</span>
              <span>Field Mapping</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Migration Name
                  </label>
                  <input
                    type="text"
                    value={migration.name}
                    onChange={(e) =>
                      setMigration({ ...migration, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="My Migration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={migration.description}
                    onChange={(e) =>
                      setMigration({ ...migration, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe this migration..."
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!migration.name}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Source
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Select Source</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Connection
                  </label>
                  <select
                    value={migration.sourceConnectionId}
                    onChange={(e) => {
                      setMigration({
                        ...migration,
                        sourceConnectionId: e.target.value,
                        sourceTable: '',
                      })
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a connection...</option>
                    {connections.map((conn) => (
                      <option key={conn.id} value={conn.id}>
                        {conn.name} ({conn.type})
                      </option>
                    ))}
                  </select>
                </div>
                {migration.sourceConnectionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Table
                    </label>
                    <select
                      value={migration.sourceTable}
                      onChange={(e) =>
                        setMigration({ ...migration, sourceTable: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a table...</option>
                      {sourceTables.map((table) => (
                        <option key={table} value={table}>
                          {table}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!migration.sourceTable}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next: Select Target
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Select Target</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Connection
                  </label>
                  <select
                    value={migration.targetConnectionId}
                    onChange={(e) => {
                      setMigration({
                        ...migration,
                        targetConnectionId: e.target.value,
                        targetTable: '',
                      })
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a connection...</option>
                    {connections.map((conn) => (
                      <option key={conn.id} value={conn.id}>
                        {conn.name} ({conn.type})
                      </option>
                    ))}
                  </select>
                </div>
                {migration.targetConnectionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Table
                    </label>
                    <select
                      value={migration.targetTable}
                      onChange={(e) =>
                        setMigration({ ...migration, targetTable: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a table...</option>
                      {targetTables.map((table) => (
                        <option key={table} value={table}>
                          {table}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!migration.targetTable}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next: Map Fields
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Field Mapping</h2>
                  <button
                    onClick={autoMapFields}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Auto Map Fields
                  </button>
                </div>

                {migration.fieldMappings.length === 0 && (
                  <p className="text-gray-600 text-center py-8">
                    Click "Auto Map Fields" to automatically map fields with the same name
                  </p>
                )}

                {migration.fieldMappings.length > 0 && (
                  <div className="space-y-4">
                    {migration.fieldMappings.map((mapping, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Source Field
                          </label>
                          <select
                            value={mapping.sourceField}
                            onChange={(e) => {
                              const newMappings = [...migration.fieldMappings]
                              newMappings[index].sourceField = e.target.value
                              setMigration({ ...migration, fieldMappings: newMappings })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {sourceColumns.map((col) => (
                              <option key={col.name} value={col.name}>
                                {col.name} ({col.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="text-gray-400">→</div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Field
                          </label>
                          <select
                            value={mapping.targetField}
                            onChange={(e) => {
                              const newMappings = [...migration.fieldMappings]
                              newMappings[index].targetField = e.target.value
                              setMigration({ ...migration, fieldMappings: newMappings })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {targetColumns.map((col) => (
                              <option key={col.name} value={col.name}>
                                {col.name} ({col.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            const newMappings = migration.fieldMappings.filter(
                              (_, i) => i !== index
                            )
                            setMigration({ ...migration, fieldMappings: newMappings })
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={migration.batchSize}
                    onChange={(e) =>
                      setMigration({
                        ...migration,
                        batchSize: parseInt(e.target.value) || 1000,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={migration.deleteBeforeInsert}
                    onChange={(e) =>
                      setMigration({
                        ...migration,
                        deleteBeforeInsert: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Delete existing records in target table before migration
                  </span>
                </label>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={migration.fieldMappings.length === 0 || loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Migration'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
