import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const requiredAssetFiles = [
  'public/vendor/vditor/dist/js/i18n/zh_CN.js',
  'public/vendor/vditor/dist/js/lute/lute.min.js',
  'public/vendor/vditor/dist/js/icons/ant.js',
  'public/vendor/vditor/dist/css/content-theme/light.css',
  'public/vendor/vditor/dist/images/emoji/vditor.png',
]

const requiredSourceUsages = [
  {
    file: 'src/config/vditor.ts',
    patterns: [/VDITOR_CDN\s*=\s*['"]\/vendor\/vditor['"]/],
  },
  {
    file: 'src/components/common/MarkdownEditor.tsx',
    patterns: [/VDITOR_CDN/, /cdn:\s*VDITOR_CDN/],
  },
  {
    file: 'src/components/common/MarkdownPreview.tsx',
    patterns: [/VDITOR_CDN/, /cdn:\s*VDITOR_CDN/],
  },
  {
    file: 'src/utils/printMarkdown.ts',
    patterns: [/VDITOR_CDN/, /cdn:\s*VDITOR_CDN/],
  },
]

const failures = []

for (const relativeFile of requiredAssetFiles) {
  if (!fs.existsSync(path.join(root, relativeFile))) {
    failures.push(`Missing Vditor asset: ${relativeFile}`)
  }
}

for (const { file, patterns } of requiredSourceUsages) {
  const absoluteFile = path.join(root, file)
  if (!fs.existsSync(absoluteFile)) {
    failures.push(`Missing source file: ${file}`)
    continue
  }

  const source = fs.readFileSync(absoluteFile, 'utf8')
  for (const pattern of patterns) {
    if (!pattern.test(source)) {
      failures.push(`Missing ${pattern} in ${file}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Vditor local assets are configured.')
