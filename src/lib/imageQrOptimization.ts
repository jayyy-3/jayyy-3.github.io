export const imageQrMaximumSourceBytes = 50 * 1024 * 1024;
export const imageQrMaximumLongEdge = 2560;
export const imageQrWebpQuality = 0.9;

const supportedInputTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export interface OptimizedQrImage {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
  changed: boolean;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

export async function optimizeImageForQr(file: File): Promise<OptimizedQrImage> {
  if (!supportedInputTypes.has(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP or AVIF image.');
  }
  if (file.size <= 0 || file.size > imageQrMaximumSourceBytes) {
    throw new Error('Each image must be smaller than 50 MB.');
  }

  const decoded = await decodeImage(file);
  try {
    const longestEdge = Math.max(decoded.width, decoded.height);
    const scale = Math.min(1, imageQrMaximumLongEdge / longestEdge);
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('This browser could not prepare the image.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(decoded.source, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, 'image/webp', imageQrWebpQuality);
    const canKeepOriginal =
      scale === 1 &&
      file.size <= webp.size &&
      supportedInputTypes.has(file.type);

    if (canKeepOriginal) {
      return {
        file,
        width,
        height,
        originalBytes: file.size,
        optimizedBytes: file.size,
        changed: false,
      };
    }

    const outputName = `${baseFileName(file.name)}.webp`;
    const optimizedFile = new File([webp], outputName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
    return {
      file: optimizedFile,
      width,
      height,
      originalBytes: file.size,
      optimizedBytes: optimizedFile.size,
      changed: true,
    };
  } finally {
    decoded.release();
  }
}

export function imageNameFromFile(fileName: string) {
  return baseFileName(fileName).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Urblo image';
}

export function formatImageBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function baseFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').trim() || 'urblo-image';
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The image could not be opened.'));
      image.src = objectUrl;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The optimized image could not be created.'));
    }, type, quality);
  });
}
