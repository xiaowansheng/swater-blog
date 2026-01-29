type CompressOptions = {
  quality?: number;
};

const DEFAULT_QUALITY = 0.82;

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

const isAnimatedWebp = async (file: File): Promise<boolean> => {
  try {
    const buffer = await readAsArrayBuffer(file);
    const bytes = new Uint8Array(buffer);
    if (
      bytes.length < 16 ||
      String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF' ||
      String.fromCharCode(...bytes.slice(8, 12)) !== 'WEBP'
    ) {
      return false;
    }

    for (let i = 12; i + 4 < bytes.length; i += 1) {
      if (
        bytes[i] === 0x41 &&
        bytes[i + 1] === 0x4e &&
        bytes[i + 2] === 0x49 &&
        bytes[i + 3] === 0x4d
      ) {
        return true;
      }
    }
  } catch {
    // Ignore and fallback to non-animated
  }
  return false;
};

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

const canvasToWebp = (
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
  });

export const compressImageIfNeeded = async (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;

  // Keep PNG, GIF, SVG unchanged
  if (
    file.type === 'image/png' ||
    file.type === 'image/gif' ||
    file.type === 'image/svg+xml'
  ) {
    return file;
  }

  // Skip animated WebP
  if (file.type === 'image/webp') {
    const animated = await isAnimatedWebp(file);
    if (animated) return file;
  }

  const quality = options.quality ?? DEFAULT_QUALITY;

  try {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToWebp(canvas, quality);
    if (!blob) return file;

    if (blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, {
      type: 'image/webp',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
};

