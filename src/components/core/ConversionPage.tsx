"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { useUser } from "@insforge/nextjs";
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
import {
  checkUsageLimit,
  logConversion,
  getUserProfile,
  type UsageCheck,
} from "@/lib/usage";

import { ImageUploader } from "./ImageUploader";
import { ConversionControls } from "./ConversionControls";
import {
  ConversionResultList,
  type ConversionItem,
} from "./ConversionResultList";

export default function ConversionPage() {
  const { user, isLoaded } = useUser();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionItems, setConversionItems] = useState<ConversionItem[]>([]);
  const [prefix, setPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(90);
  const [language, setLanguage] = useState<"spanish" | "english">("spanish");
  const [useAiForName, setUseAiForName] = useState(true);
  const [maxBatchSize, setMaxBatchSize] = useState(5);
  const { toast } = useToast();

  // Load user profile to get batch size limit
  useEffect(() => {
    if (isLoaded && user) {
      getUserProfile(user.id).then((profile) => {
        if (profile) {
          setMaxBatchSize(profile.max_batch_size);
        }
      });
    }
  }, [isLoaded, user]);

  const handleFilesSelect = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setConversionItems([]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setConversionItems([]);
  }, []);

  const processImage = async (
    file: File,
    itemId: string
  ): Promise<Partial<ConversionItem>> => {
    try {
      const metadata = await getImageMetadata(file);

      setConversionItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, originalMetadata: metadata, status: "processing" }
            : item
        )
      );

      const webpResult = await convertToWebP(metadata, {
        quality: compressionQuality / 100,
      });

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

      const now = new Date();
      const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const randomPart = String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0"
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

    // Check usage limits if user is authenticated and AI is being used
    if (user && useAiForName) {
      const usageCheck = await checkUsageLimit(
        user.id,
        selectedFiles.length,
        true
      );
      if (!usageCheck.allowed) {
        toast({
          title: "Límite alcanzado",
          description: `Has usado ${usageCheck.used} de ${usageCheck.limit} conversiones IA este mes. Te quedan ${usageCheck.remaining}. Desactiva la IA o actualiza tu plan.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    const initialItems: ConversionItem[] = selectedFiles.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      originalFile: file,
      originalMetadata: null,
      convertedResult: null,
      finalName: file.name,
      status: "pending",
    }));
    setConversionItems(initialItems);

    for (const item of initialItems) {
      setConversionItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "processing" } : i
        )
      );

      const result = await processImage(item.originalFile, item.id);

      setConversionItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...result } : i))
      );
    }

    setIsLoading(false);

    // Log the conversion
    if (user) {
      await logConversion(user.id, selectedFiles.length, useAiForName);
    }

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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Controls & Info */}
        <Card className="shadow-lg bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Convierte tus imágenes a WebP
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
              maxFiles={maxBatchSize}
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
    </div>
  );
}
