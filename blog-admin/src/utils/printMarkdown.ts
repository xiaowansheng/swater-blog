import Vditor from 'vditor'
import 'vditor/dist/index.css'

const escapeHtml = (input: string) => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const collectCssText = () => {
  let cssText = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules
      for (const rule of Array.from(rules)) {
        cssText += `${rule.cssText}\n`
      }
    } catch {
      // ignore cross-origin stylesheets
    }
  }
  return cssText
}

export const printMarkdownAsPdf = async (title: string, markdown: string): Promise<void> => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('弹窗被浏览器拦截，请允许弹窗后重试')
  }

  const cssText = collectCssText()
  const safeTitle = escapeHtml(title || 'article')

  printWindow.document.open()
  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>${cssText}</style>
  <style>
    @page { margin: 16mm; }
    body { background: #fff; color: #111; }
    img { max-width: 100%; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    .print-container { max-width: 900px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="print-container">
    <div id="md" class="vditor-reset"></div>
  </div>
</body>
</html>`)
  printWindow.document.close()

  const container = printWindow.document.getElementById('md')
  if (!container) {
    throw new Error('打印页面初始化失败')
  }

  // Vditor preview 渲染是异步的，给浏览器一次布局机会
  await new Promise((r) => setTimeout(r, 0))
  Vditor.preview(container as HTMLDivElement, markdown, {
    theme: {
      current: 'light',
    },
    mode: 'light',
  })

  // 等待渲染完成后再触发打印
  await new Promise((r) => setTimeout(r, 150))
  printWindow.focus()
  printWindow.print()
}
