import html2pdf from 'html2pdf.js'

/**
 * 等待图片加载完成
 */
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img')
  if (images.length === 0) return Promise.resolve()

  const promises = Array.from(images).map((img) => {
    if (img.complete) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve() // 即使图片加载失败也继续
      // 设置超时，避免图片一直加载不完成
      setTimeout(() => resolve(), 3000)
    })
  })

  return Promise.all(promises).then(() => {})
}

/**
 * 将已渲染的 DOM 元素导出为 PDF 文件并直接下载
 * @param element 要导出的 HTML 元素
 * @param filename 导出的文件名（不含扩展名）
 */
export const exportElementAsPdf = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  if (!element) {
    throw new Error('要导出的元素不存在')
  }

  console.log('开始准备导出 PDF...', {
    element,
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    innerHTML: element.innerHTML?.substring(0, 200),
  })

  // 等待图片加载完成
  console.log('等待图片加载...')
  await waitForImages(element)

  // 再等待一下确保所有内容都已渲染
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('开始生成 PDF...')

  // 配置 PDF 选项
  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  // 生成并下载 PDF
  const pdfWorker = html2pdf().set(opt).from(element)

  console.log('开始保存 PDF...')
  await pdfWorker.save()
  console.log('PDF 保存完成')
}
