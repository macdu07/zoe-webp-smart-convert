"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, ImagePlay } from "lucide-react";
import { UserButton } from "@insforge/nextjs";
import {
  generateImageName,
  type GenerateImageNameInput,
} from "@/ai/flows/generate-image-name";
import {
  getImageMetadata,
  convertToWebP,
  formatBytes,
  type ImageMetadata,
  type WebPConversionResult,
} from "@/lib/imageUtils";

import { ImageUploader } from "./ImageUploader";
import { ConversionControls } from "./ConversionControls";
import {
  ConversionResultList,
  type ConversionItem,
} from "./ConversionResultList";

export default function ConversionPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionItems, setConversionItems] = useState<ConversionItem[]>([]);
  const [prefix, setPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(90);
  const [language, setLanguage] = useState<"spanish" | "english">("spanish");
  const [useAiForName, setUseAiForName] = useState(true);
  const { toast } = useToast();


  const handleFilesSelect = useCallback((files: File[]) => {
    setSelectedFiles(files);
    // Reset conversion items when new files are selected
    setConversionItems([]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setConversionItems([]);
  }, []);

  const processImage = async (
    file: File,
    itemId: string,
  ): Promise<Partial<ConversionItem>> => {
    try {
      // Get metadata
      const metadata = await getImageMetadata(file);

      // Update status to processing
      setConversionItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, originalMetadata: metadata, status: "processing" }
            : item,
        ),
      );

      // Convert to WebP
      const webpResult = await convertToWebP(metadata, {
        quality: compressionQuality / 100,
      });

      // Generate name
      let finalBaseName = "converted-image";

      if (useAiForName) {
        try {
          const smallImage = await convertToWebP(metadata, {
            targetWidth: 512,
            quality: 0.6,
          });
          const aiInput: GenerateImageNameInput = {
            photoDataUri: smallImage.dataUrl,
            language,
          };
          const aiOutput = await generateImageName(aiInput);
          let generatedName = aiOutput.filename;
          if (prefix.trim()) {
            generatedName = `${prefix
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")}-${generatedName}`;
          }
          finalBaseName = generatedName;
        } catch (aiError) {
          console.error("AI naming error:", aiError);
          // Fallback to original filename
          const lastDotIndex = file.name.lastIndexOf(".");
          finalBaseName = file.name
            .substring(0, lastDotIndex)
            .toLowerCase()
            .replace(/\s+/g, "-");
          if (prefix.trim()) {
            finalBaseName = `${prefix
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")}-${finalBaseName}`;
          }
        }
      } else {
        const trimmedPrefix = prefix.trim().toLowerCase().replace(/\s+/g, "-");
        if (trimmedPrefix) {
          finalBaseName = trimmedPrefix;
        } else {
          const lastDotIndex = file.name.lastIndexOf(".");
          finalBaseName = file.name
            .substring(0, lastDotIndex)
            .toLowerCase()
            .replace(/\s+/g, "-");
        }
      }

      // Add unique suffix: YYMMDD-XXXXX (date + random 5-digit number)
      const now = new Date();
      const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const randomPart = String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0",
      );
      const finalName = `${finalBaseName}-${datePart}-${randomPart}.webp`;

      return {
        originalMetadata: metadata,
        convertedResult: webpResult,
        finalName,
        status: "done",
      };
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "Error desconocido al procesar.";
      return {
        status: "error",
        error: errorMsg,
      };
    }
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No hay imágenes",
        description: "Por favor, sube al menos una imagen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Initialize conversion items
    const initialItems: ConversionItem[] = selectedFiles.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      originalFile: file,
      originalMetadata: null,
      convertedResult: null,
      finalName: file.name,
      status: "pending",
    }));
    setConversionItems(initialItems);

    // Process images sequentially to avoid overwhelming the AI
    for (const item of initialItems) {
      setConversionItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "processing" } : i,
        ),
      );

      const result = await processImage(item.originalFile, item.id);

      setConversionItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...result } : i)),
      );
    }

    setIsLoading(false);

    const doneCount = initialItems.length; // Will be updated by state
    toast({
      title: "Conversión Completada",
      description: `Se procesaron ${selectedFiles.length} imagen(es).`,
    });
  };



  const handleClear = () => {
    setSelectedFiles([]);
    setConversionItems([]);
    setPrefix("");
    setCompressionQuality(90);
    setLanguage("spanish");
    setUseAiForName(true);
    toast({
      title: "Formulario Limpiado",
      description: "Puedes subir nuevas imágenes.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <ImagePlay className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-semibold">Zoe Convert</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="mr-1 h-4 w-4" /> Help
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Controls & Info */}
          <Card className="shadow-lg bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Convert your images to smart WebP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader
                selectedFiles={selectedFiles}
                onFilesSelect={handleFilesSelect}
                onRemoveFile={handleRemoveFile}
                onError={(msg) => {
                  toast({
                    title: "Error",
                    description: msg,
                    variant: "destructive",
                  });
                }}
                onClear={handleClear}
              />

              <ConversionControls
                useAiForName={useAiForName}
                setUseAiForName={setUseAiForName}
                prefix={prefix}
                setPrefix={setPrefix}
                language={language}
                setLanguage={setLanguage}
                compressionQuality={compressionQuality}
                setCompressionQuality={setCompressionQuality}
                onConvert={handleConvert}
                onClear={handleClear}
                isLoading={isLoading}
                hasFile={selectedFiles.length > 0}
                hasResult={conversionItems.length > 0}
              />
            </CardContent>
          </Card>

          {/* Right Column: Results List */}
          <ConversionResultList
            items={conversionItems}
            compressionQuality={compressionQuality}
            useAiForName={useAiForName}
          />
        </div>
      </main>

      <footer className="bg-background border-t border-border text-center py-4 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Zoe Convert. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
