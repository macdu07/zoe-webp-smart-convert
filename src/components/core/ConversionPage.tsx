"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, ImagePlay, LogOut } from "lucide-react";
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
import { logoutAction } from "@/app/actions";
import { ImageUploader } from "./ImageUploader";
import { ConversionControls } from "./ConversionControls";
import { ConversionResult } from "./ConversionResult";

export default function ConversionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<ImageMetadata | null>(
    null
  );
  const [convertedImage, setConvertedImage] =
    useState<WebPConversionResult | null>(null);
  const [prefix, setPrefix] = useState("");
  const [finalName, setFinalName] = useState("your-awesome-image.webp");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionQuality, setCompressionQuality] = useState(90); // 5-100
  const [language, setLanguage] = useState<"spanish" | "english">("spanish");
  const [useAiForName, setUseAiForName] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setConvertedImage(null);
    setFinalName("your-awesome-image.webp");
    try {
      const metadata = await getImageMetadata(file);
      setOriginalImage(metadata);
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "Error al procesar la imagen.";
      toast({
        title: "Error de Carga",
        description: errorMsg,
        variant: "destructive",
      });
      setError(errorMsg);
      setOriginalImage(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !originalImage) {
      toast({
        title: "No hay imagen",
        description: "Por favor, sube una imagen primero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setFinalName("Generando nombre...");

    try {
      const webpResult = await convertToWebP(originalImage, {
        quality: compressionQuality / 100,
      });
      setConvertedImage(webpResult);
      toast({
        title: "Conversión Exitosa",
        description: `Imagen convertida a WebP (${formatBytes(
          webpResult.sizeBytes
        )}).`,
      });

      let finalBaseName = "converted-image";

      if (useAiForName) {
        // Optimize for AI: Resize image to max 512px width to reduce payload
        const smallImage = await convertToWebP(originalImage, {
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
        toast({
          title: "Nombre Generado por IA",
          description: `Sugerencia: ${finalBaseName}.webp`,
        });
      } else {
        const trimmedPrefix = prefix.trim().toLowerCase().replace(/\s+/g, "-");
        if (trimmedPrefix) {
          finalBaseName = trimmedPrefix;
        } else {
          // Use original filename without extension if no prefix
          const lastDotIndex = originalImage.name.lastIndexOf(".");
          finalBaseName = originalImage.name
            .substring(0, lastDotIndex)
            .toLowerCase()
            .replace(/\s+/g, "-");
        }
      }

      const completeFinalName = `${finalBaseName}.webp`;
      setFinalName(completeFinalName);
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "Ocurrió un error desconocido.";
      console.error("Conversion/Naming Error:", e);
      toast({
        title: "Error en el Proceso",
        description: errorMsg,
        variant: "destructive",
      });
      setError(errorMsg);
      setConvertedImage(null);
      setFinalName("error-al-generar.webp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setConvertedImage(null);
    setPrefix("");
    setFinalName("your-awesome-image.webp");
    setError(null);
    setCompressionQuality(90); // Reset to default
    setLanguage("spanish"); // Reset to default
    setUseAiForName(true); // Reset to default
    toast({
      title: "Formulario Limpiado",
      description: "Puedes subir una nueva imagen.",
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="mr-1 h-4 w-4" /> Help
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
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
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onError={(msg) => {
                  toast({
                    title: "Error",
                    description: msg,
                    variant: "destructive",
                  });
                  setError(msg);
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
                hasFile={!!selectedFile}
                hasResult={!!convertedImage}
              />
            </CardContent>
          </Card>

          {/* Right Column: Image Comparer & Results */}
          <ConversionResult
            originalImage={originalImage}
            convertedImage={convertedImage}
            finalName={finalName}
            compressionQuality={compressionQuality}
            isLoading={isLoading}
            error={error}
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
