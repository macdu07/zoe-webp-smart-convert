
"use client";

export interface ImageMetadata {
  dataUrl: string;
  sizeBytes: number;
  type: string;
  name: string;
  width: number;
  height: number;
}

export interface WebPConversionResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          sizeBytes: file.size,
          type: file.type,
          name: file.name,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function convertToWebP(
  originalImage: { dataUrl: string; width: number; height: number },
  options: { targetMaxKB?: number; quality?: number; targetWidth?: number } = {} // quality is 0-1
): Promise<WebPConversionResult> {
  const { quality = 0.95, targetWidth } = options; // Default quality 0.95 (95%)

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context.'));
      }

      let { width, height } = originalImage;

      if (targetWidth && width > targetWidth) {
        const aspectRatio = height / width;
        width = targetWidth;
        height = targetWidth * aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      const blob = dataURLtoBlob(webpDataUrl);
      
      // The targetMaxKB is not strictly enforced here if quality is user-defined.
      // It can be used for warnings or further logic if needed.
      // For instance, if options.targetMaxKB is set:
      // const targetMaxBytes = (options.targetMaxKB || 800) * 1024;
      // if (blob.size > targetMaxBytes) {
      //   console.warn(`Image size (${(blob.size / 1024).toFixed(1)}KB) at quality ${quality*100}% exceeds target ${options.targetMaxKB}KB.`);
      // }

      resolve({ dataUrl: webpDataUrl, sizeBytes: blob.size, width, height });
    };
    img.onerror = (err) => reject(new Error(`Failed to load image for conversion: ${err}`));
    img.src = originalImage.dataUrl;
  });
}

function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  if (arr.length < 2) throw new Error('Invalid data URL');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) throw new Error('Cannot parse MIME type from data URL');
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
