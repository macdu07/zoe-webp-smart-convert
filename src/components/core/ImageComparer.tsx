"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImageComparerProps {
  originalSrc?: string;
  convertedSrc?: string;
  originalAlt?: string;
  convertedAlt?: string;
  aspectRatio?: string; // e.g., "16/9" or "4/3"
}

export function ImageComparer({
  originalSrc,
  convertedSrc,
  originalAlt = "Original Image",
  convertedAlt = "Converted Image",
  aspectRatio = "16/9", // Default aspect ratio
}: ImageComparerProps) {
  const [sliderValue, setSliderValue] = useState(50);

  const showPlaceholder = !originalSrc && !convertedSrc;
  const showOriginalOnly = originalSrc && !convertedSrc;
  const showConvertedOnly = !originalSrc && convertedSrc;
  const showBoth = originalSrc && convertedSrc;

  const placeholderText = "Sube una imagen para iniciar la comparación visual";

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div
          className={cn(
            "relative w-full bg-muted rounded-md overflow-hidden",
            showPlaceholder && "flex items-center justify-center text-muted-foreground text-center min-h-[200px] md:min-h-[300px]"
          )}
          style={{ aspectRatio }}
        >
          {showPlaceholder && <p className="p-4">{placeholderText}</p>}

          {originalSrc && (
            <Image
              src={originalSrc}
              alt={originalAlt}
              layout="fill"
              objectFit="contain"
              className="rounded-md"
              data-ai-hint="photo comparison"
            />
          )}

          {showBoth && convertedSrc && (
            <div
              className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-md"
              style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
            >
              <Image
                src={convertedSrc}
                alt={convertedAlt}
                layout="fill"
                objectFit="contain"
                className="rounded-md"
                data-ai-hint="photo result"
              />
            </div>
          )}

          {showConvertedOnly && convertedSrc && (
             <Image
                src={convertedSrc}
                alt={convertedAlt}
                layout="fill"
                objectFit="contain"
                className="rounded-md"
                data-ai-hint="photo converted"
              />
          )}
        </div>

        {showBoth && (
          <div className="mt-4 pt-2">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Original</span>
              <span>Convertida (WebP)</span>
            </div>
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              aria-label="Image comparison slider"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
