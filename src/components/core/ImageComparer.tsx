
"use client";

import { useState, useEffect } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict with HTMLImageElement
import { Slider } from '@/components/ui/slider';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageComparerProps {
  originalSrc?: string;
  convertedSrc?: string;
  originalAlt?: string;
  convertedAlt?: string;
  aspectRatio?: string; 
}

export function ImageComparer({
  originalSrc,
  convertedSrc,
  originalAlt = "Original Image",
  convertedAlt = "Converted Image",
  aspectRatio = "3/2",
}: ImageComparerProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(true);
  const [isLoadingConverted, setIsLoadingConverted] = useState(true);
  
  useEffect(() => {
    if (originalSrc) setIsLoadingOriginal(true); else setIsLoadingOriginal(false);
  }, [originalSrc]);

  useEffect(() => {
    if (convertedSrc) setIsLoadingConverted(true); else setIsLoadingConverted(false);
  }, [convertedSrc]);

  const showOriginal = !!originalSrc;
  const showConverted = !!convertedSrc;
  const showBoth = showOriginal && showConverted;
  const showPlaceholderOnly = !showOriginal && !showConverted;

  // Determine active state for loading skeletons
  const originalLoadingActive = showOriginal && isLoadingOriginal;
  const convertedLoadingActive = showConverted && isLoadingConverted;


  return (
    <div className="w-full">
      <div
        className={cn(
          "relative w-full bg-muted rounded-md overflow-hidden border border-border",
          showPlaceholderOnly && "flex items-center justify-center text-muted-foreground text-center min-h-[200px] md:min-h-[300px]"
        )}
        style={{ aspectRatio: aspectRatio }}
      >
        {/* Original Image */}
        {showOriginal && (
          <div className="relative w-full h-full">
            {originalLoadingActive && <Skeleton className="absolute inset-0 w-full h-full rounded-md" />}
            <NextImage
              src={originalSrc!}
              alt={originalAlt}
              fill
              style={{ objectFit: "contain" }}
              className={cn(
                "rounded-md transition-opacity duration-300",
                originalLoadingActive ? "opacity-0" : "opacity-100"
              )}
              onLoadingComplete={() => setIsLoadingOriginal(false)}
              onError={() => setIsLoadingOriginal(false)}
            />
             <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 text-xs rounded">
              Original (JPG/PNG)
            </div>
          </div>
        )}

        {/* Converted Image (clipped) */}
        {showBoth && (
          <div
            className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-md"
            style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
          >
             <div className="relative w-full h-full">
              {convertedLoadingActive && <Skeleton className="absolute inset-0 w-full h-full rounded-md" />}
              <NextImage
                src={convertedSrc!}
                alt={convertedAlt}
                fill
                style={{ objectFit: "contain" }}
                className={cn(
                  "rounded-md transition-opacity duration-300",
                  convertedLoadingActive ? "opacity-0" : "opacity-100"
                )}
                onLoadingComplete={() => setIsLoadingConverted(false)}
                onError={() => setIsLoadingConverted(false)}
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 text-xs rounded">
                Converted (WebP)
              </div>
            </div>
          </div>
        )}
        
        {/* Display only converted if original is not available but converted is */}
        {!showOriginal && showConverted && (
            <div className="relative w-full h-full">
                {convertedLoadingActive && <Skeleton className="absolute inset-0 w-full h-full rounded-md" />}
                <NextImage
                    src={convertedSrc!}
                    alt={convertedAlt}
                    fill
                    style={{ objectFit: "contain" }}
                    className={cn(
                      "rounded-md transition-opacity duration-300",
                      convertedLoadingActive ? "opacity-0" : "opacity-100"
                    )}
                    onLoadingComplete={() => setIsLoadingConverted(false)}
                    onError={() => setIsLoadingConverted(false)}
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

      {showBoth && (
        <div className="mt-4 pt-2">
          <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            value={[sliderValue]}
            onValueChange={(value) => setSliderValue(value[0])}
            aria-label="Image comparison slider"
            className="[&>span:last-child]:bg-primary [&>span:last-child]:border-primary-foreground"
          />
        </div>
      )}
    </div>
  );
}
