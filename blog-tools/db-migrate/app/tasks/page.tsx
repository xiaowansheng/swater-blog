'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, Clock, X } from 'lucide-react'

interface Task {
  id: string
  status: string
  totalRecords: number
  processedRecords: number
  failedRecords: number
  startTime?: string
  endTime?: string
  errorMessage?: string
  config: {
    name: string
    sourceTable: { tableName: string }
    targetTable: { tableName: string }
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewTaskLogs = async (task: Task) => {
    setSelectedTask(task)
    try {
      const response = await fetch(`/api/tasks/${task.id}`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const cancelTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Failed to cancel task:', error)
      alert('Failed to cancel task')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const calculateProgress = (task: Task) => {
    if (task.totalRecords === 0) return 0
    return Math.round((task.processedRecords / task.totalRecords) * 100)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Migration Tasks</h1>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h2>
            <p className="text-gray-600">
              Run a migration to see its progress and history here
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-xl font-semibold text-gray-900">
                        {task.config.name}
                      </h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {task.config.sourceTable.tableName} → {task.config.targetTable.tableName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'running' && (
                      <button
                        onClick={() => cancelTask(task.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => viewTaskLogs(task)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Logs
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>
                      {task.processedRecords} / {task.totalRecords} records
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(task)}%` }}
                    />
                  </div>
                  {task.failedRecords > 0 && (
                    <p className="text-sm text-red-600">
                      {task.failedRecords} records failed
                    </p>
                  )}
                </div>

                {task.errorMessage && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{task.errorMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Logs Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Task Logs</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        log.level === 'error'
                          ? 'bg-red-50 text-red-900'
                          : log.level === 'warning'
                          ? 'bg-yellow-50 text-yellow-900'
                          : 'bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium uppercase">{log.level}</span>
                        <span className="text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
