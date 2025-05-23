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
  options: { targetMaxKB?: number; initialQuality?: number; targetWidth?: number } = {}
): Promise<WebPConversionResult> {
  const { targetMaxKB = 800, initialQuality = 0.9, targetWidth } = options;
  const targetMaxBytes = targetMaxKB * 1024;

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

      let currentQuality = initialQuality;
      const MAX_ATTEMPTS = 10; // Max attempts to reduce quality
      let attempts = 0;

      function attemptConversion() {
        if (attempts >= MAX_ATTEMPTS || currentQuality < 0.05) { // Min quality guard
          // If still too large after max attempts or min quality, try one last time with very low quality
          const webpDataUrl = canvas.toDataURL('image/webp', 0.1); 
          const blob = dataURLtoBlob(webpDataUrl);
          if (blob.size > targetMaxBytes) {
             return reject(new Error(`Image too large (${(blob.size / 1024).toFixed(1)}KB) even at lowest quality. Max allowed: ${targetMaxKB}KB.`));
          }
           resolve({ dataUrl: webpDataUrl, sizeBytes: blob.size, width, height });
          return;
        }

        const webpDataUrl = canvas.toDataURL('image/webp', currentQuality);
        const blob = dataURLtoBlob(webpDataUrl);

        if (blob.size <= targetMaxBytes) {
          resolve({ dataUrl: webpDataUrl, sizeBytes: blob.size, width, height });
        } else {
          currentQuality -= 0.1; // Reduce quality for next attempt
          attempts++;
          // Add a small delay to allow UI to update if this were a long loop
          // For this client-side logic, direct recursion is fine.
          attemptConversion(); 
        }
      }
      
      attemptConversion();
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
