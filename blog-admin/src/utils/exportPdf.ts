import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
 * 使用 jsPDF + html2canvas 直接组合（替代已停更的 html2pdf.js 封装）。
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

  // 等待图片加载完成
  await waitForImages(element)

  // 再等待一下确保所有内容都已渲染
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 1) 将 DOM 转为 canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.offsetWidth,
    height: element.scrollHeight,
  })

  // 2) 生成 PDF，按 A4 分页
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10 // mm
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  // 按宽度等比缩放图片，按可用高度分页
  const imgWidth = usableWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  let renderedHeight = 0
  let pageIndex = 0

  while (renderedHeight < imgHeight) {
    if (pageIndex > 0) {
      pdf.addPage()
    }
    // 计算当前页应渲染的图片片段高度（mm）
    const sliceHeight = Math.min(usableHeight, imgHeight - renderedHeight)
    // 通过 setProperty 在 jsPDF 中偏移绘制图片，实现分页
    // jsPDF addImage 不支持负 y 偏移裁剪，需用临时 canvas 切片
    if (sliceHeight < usableHeight || renderedHeight > 0) {
      // 计算源 canvas 上的像素切片
      const srcSliceHeightPx = (sliceHeight * canvas.width) / imgWidth
      const srcOffsetPx = (renderedHeight * canvas.width) / imgWidth
      const tmpCanvas = document.createElement('canvas')
      tmpCanvas.width = canvas.width
      tmpCanvas.height = Math.ceil(srcSliceHeightPx)
      const ctx = tmpCanvas.getContext('2d')
      if (!ctx) break
      ctx.drawImage(
        canvas,
        0,
        srcOffsetPx,
        canvas.width,
        srcSliceHeightPx,
        0,
        0,
        canvas.width,
        srcSliceHeightPx
      )
      const sliceData = tmpCanvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(sliceData, 'JPEG', margin, margin, imgWidth, sliceHeight)
    } else {
      // 单页完整放得下
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
    }
    renderedHeight += sliceHeight
    pageIndex++
  }

  pdf.save(`${filename}.pdf`)
}
