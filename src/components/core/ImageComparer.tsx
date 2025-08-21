
"use client";

import { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { Slider } from '@/components/ui/slider';
import { ImageIcon, MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageComparerProps {
  original?: string;
  converted?: string;
  aspectRatio?: string;
}

export function ImageComparer({
  original,
  converted,
  aspectRatio = "3/2",
}: ImageComparerProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMove = (clientX: number) => {
    if (!isResizing || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

  const stopResizing = () => setIsResizing(false);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', stopResizing);
      window.addEventListener('touchend', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchend', stopResizing);
    };
  }, [isResizing, handleMove]);

  const showOriginal = !!original;
  const showConverted = !!converted;
  const showBoth = showOriginal && showConverted;
  const showPlaceholderOnly = !showOriginal && !showConverted;

  return (
    <div className="w-full">
      <div
        ref={imageContainerRef}
        className={cn(
          "relative w-full bg-muted rounded-md overflow-hidden border border-border select-none",
          showPlaceholderOnly && "flex items-center justify-center text-muted-foreground text-center min-h-[200px] md:min-h-[300px]",
          isResizing && "cursor-ew-resize"
        )}
        style={{ aspectRatio }}
      >
        {/* Original Image */}
        {showOriginal && (
          <div className="relative w-full h-full">
            <NextImage
              src={original}
              alt="Original Image"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-md"
              unoptimized
            />
          </div>
        )}
        
        {/* Converted Image (clipped) */}
        {showBoth && (
            <div
              className="absolute top-0 left-0 h-full w-full overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <NextImage
                src={converted}
                alt="Converted Image"
                fill
                style={{ objectFit: "contain" }}
                className="rounded-md"
                unoptimized
              />
            </div>
        )}
        
        {/* Labels - Rendered on top so they are always visible */}
        {showBoth && (
          <>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 text-xs rounded z-10">
              Original (JPG/PNG)
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 text-xs rounded z-10">
              Converted (WebP)
            </div>
          </>
        )}
        
        {/* Slider Handle */}
        {showBoth && (
          <div
            className="absolute top-0 h-full w-1 bg-primary cursor-ew-resize z-20"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleResize}
            onTouchStart={handleResize}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <MoveHorizontal className="h-4 w-4" />
            </div>
          </div>
        )}
        
        {!showOriginal && showConverted && (
            <div className="relative w-full h-full">
                <NextImage
                    src={converted}
                    alt="Converted Image"
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-md"
                    unoptimized
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 text-xs rounded">
                    Converted (WebP)
                </div>
            </div>
        )}

        {showPlaceholderOnly && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                <ImageIcon className="w-16 h-16 mb-4 text-primary/30" />
                <p className="text-center text-sm">Upload an image to see the comparison.</p>
                <p className="text-xs text-muted-foreground/80 text-center mt-1">Original and WebP versions will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
