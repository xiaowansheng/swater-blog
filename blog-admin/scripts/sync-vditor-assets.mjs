import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const vditorPackageDir = path.dirname(require.resolve('vditor/package.json'))
const sourceDir = path.join(vditorPackageDir, 'dist')
const targetDir = path.join(root, 'public/vendor/vditor/dist')

if (!fs.existsSync(sourceDir)) {
  console.error(`Vditor dist directory not found: ${sourceDir}`)
  process.exit(1)
}

fs.rmSync(targetDir, { recursive: true, force: true })
fs.mkdirSync(path.dirname(targetDir), { recursive: true })
fs.cpSync(sourceDir, targetDir, { recursive: true })

console.log(`Synced Vditor assets to ${path.relative(root, targetDir)}`)
