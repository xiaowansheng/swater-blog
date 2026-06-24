/**
 * 图片压缩工具 — blog-admin 端
 * 上传前对 JPEG/PNG 图片进行压缩并转为 WebP 格式
 */
type CompressOptions = {
  quality?: number;
  maxWidth?: number;
};

const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_WIDTH = 1920;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });

export async function compressImageIfNeeded(file: File, options: CompressOptions = {}): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  if (file.type === 'image/gif' || file.type === 'image/svg+xml' || file.type === 'image/png') return file;

  if (file.type === 'image/webp' && file.size < 512 * 1024) return file;

  const quality = options.quality ?? DEFAULT_QUALITY;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxWidth / Math.max(img.naturalWidth, img.naturalHeight, 1));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round((img.naturalWidth || img.width) * scale);
    canvas.height = Math.round((img.naturalHeight || img.height) * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, {
      type: 'image/webp',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
