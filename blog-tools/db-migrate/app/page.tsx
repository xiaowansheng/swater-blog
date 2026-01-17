import Link from 'next/link'
import { Database, ArrowRight, Settings, History } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Database Migration Tool
          </h1>
          <p className="text-xl text-gray-600">
            A powerful tool for migrating data between databases
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link
            href="/connections"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connections
              </h2>
              <p className="text-gray-600 mb-4">
                Manage database connections
              </p>
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/migrations"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Migrations
              </h2>
              <p className="text-gray-600 mb-4">
                Configure and run migrations
              </p>
              <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/tasks"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <History className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tasks
              </h2>
              <p className="text-gray-600 mb-4">
                View migration history and logs
              </p>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center text-gray-600">
          <h3 className="text-2xl font-bold mb-4">Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-bold mb-1">Easy Migration</h4>
              <p className="text-sm">Simple wizard to configure migrations</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-bold mb-1">Field Mapping</h4>
              <p className="text-sm">Map fields between tables</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold mb-1">Fast Processing</h4>
              <p className="text-sm">Batch processing for speed</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-bold mb-1">Detailed Logs</h4>
              <p className="text-sm">Track migration progress</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
