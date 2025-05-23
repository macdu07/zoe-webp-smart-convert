"use client";

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ImageComparer } from './ImageComparer';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { UploadCloud, Download, Sparkles, Info, Loader2, FileImage, Tag, Weight, ImagePlay } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateImageName, type GenerateImageNameInput } from '@/ai/flows/generate-image-name';
import { getImageMetadata, convertToWebP, formatBytes, type ImageMetadata, type WebPConversionResult } from '@/lib/imageUtils';

interface ConversionResult {
  original: ImageMetadata;
  converted: WebPConversionResult;
  aiName: string;
  finalName: string;
}

export default function ConversionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<ImageMetadata | null>(null);
  const [convertedImage, setConvertedImage] = useState<WebPConversionResult | null>(null);
  const [prefix, setPrefix] = useState('');
  const [finalName, setFinalName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast({ title: 'Tipo de archivo no válido', description: 'Por favor, sube una imagen JPG, JPEG o PNG.', variant: 'destructive' });
        setSelectedFile(null);
        setOriginalImage(null);
        setConvertedImage(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setConvertedImage(null); // Reset converted image on new file upload
      setFinalName('');
      try {
        const metadata = await getImageMetadata(file);
        setOriginalImage(metadata);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Error al procesar la imagen.';
        toast({ title: 'Error de Carga', description: errorMsg, variant: 'destructive' });
        setError(errorMsg);
        setOriginalImage(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !originalImage) {
      toast({ title: 'No hay imagen', description: 'Por favor, sube una imagen primero.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Convert to WebP
      const webpResult = await convertToWebP(originalImage, { targetMaxKB: 800, targetWidth: 1920 });
      setConvertedImage(webpResult);
      toast({ title: 'Conversión Exitosa', description: `Imagen convertida a WebP (${formatBytes(webpResult.sizeBytes)}).` });

      // 2. Generate AI Name
      const aiInput: GenerateImageNameInput = { photoDataUri: originalImage.dataUrl };
      const aiOutput = await generateImageName(aiInput);
      
      let generatedName = aiOutput.filename;
      if (prefix.trim()) {
        generatedName = `${prefix.trim().toLowerCase().replace(/\s+/g, '-')}-${generatedName}`;
      }
      const completeFinalName = `${generatedName}.webp`;
      setFinalName(completeFinalName);

      toast({ title: 'Nombre Generado', description: `Nombre AI: ${completeFinalName}` });

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      console.error("Conversion/Naming Error:", e);
      toast({ title: 'Error en el Proceso', description: errorMsg, variant: 'destructive' });
      setError(errorMsg);
      setConvertedImage(null); // Clear converted image on error
      setFinalName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedImage?.dataUrl || !finalName) {
      toast({ title: 'Error de Descarga', description: 'No hay imagen convertida para descargar.', variant: 'destructive' });
      return;
    }
    const link = document.createElement('a');
    link.href = convertedImage.dataUrl;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Descarga Iniciada', description: `Descargando ${finalName}` });
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon />
            <h1 className="text-xl md:text-2xl font-semibold text-primary">Zoe WebP Smart Convert</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Controls & Info */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileImage className="text-primary"/>Configuración de Conversión</CardTitle>
                <CardDescription>Sube tu imagen y personaliza el nombre del archivo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium">Subir Imagen (JPG, PNG)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden" 
                  />
                  <Button onClick={triggerFileInput} variant="outline" className="w-full mt-1">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                  </Button>
                  {originalImage && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Original: {originalImage.name} ({formatBytes(originalImage.sizeBytes)}) - {originalImage.width}x{originalImage.height}px</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="prefix" className="text-sm font-medium">Prefijo Opcional</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prefix"
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="Ej: mi-marca-"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleConvert} disabled={isLoading || !selectedFile} className="w-full font-semibold">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Procesando...' : 'Convertir y Nombrar'}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {(originalImage || convertedImage) && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Weight className="text-primary"/>Resultados de la Conversión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {originalImage && (
                  <div>
                    <h4 className="font-semibold">Imagen Original:</h4>
                    <p>Nombre: {originalImage.name}</p>
                    <p>Tamaño: {formatBytes(originalImage.sizeBytes)}</p>
                    <p>Dimensiones: {originalImage.width}x{originalImage.height}px</p>
                    <p>Tipo: {originalImage.type}</p>
                  </div>
                )}
                {convertedImage && (
                  <div>
                    <h4 className="font-semibold mt-2">Imagen Convertida (WebP):</h4>
                    <p>Nombre Final: {finalName || <span className="italic text-muted-foreground">Generando...</span>}</p>
                    <p>Tamaño: {formatBytes(convertedImage.sizeBytes)}</p>
                    <p>Dimensiones: {convertedImage.width}x{convertedImage.height}px</p>
                  </div>
                )}
              </CardContent>
              {convertedImage && finalName && (
                <CardFooter>
                  <Button onClick={handleDownload} className="w-full font-semibold" variant="default">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar {finalName}
                  </Button>
                </CardFooter>
              )}
            </Card>
            )}
          </div>

          {/* Right Column: Image Comparer */}
          <div className="sticky top-20"> {/* Sticky for comparer on larger screens */}
            <Card className="shadow-lg">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImagePlay className="text-primary"/>Comparador Visual</CardTitle>
                  <CardDescription>Compara la imagen original con la convertida.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ImageComparer
                    originalSrc={originalImage?.dataUrl}
                    convertedSrc={convertedImage?.dataUrl}
                    originalAlt={originalImage?.name || "Original"}
                    convertedAlt={finalName || "Convertida"}
                    aspectRatio={originalImage ? `${originalImage.width}/${originalImage.height}` : "16/9"}
                  />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-border text-center py-4 mt-auto">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Zoe WebP Smart Convert. Potenciado por IA.</p>
      </footer>
    </div>
  );
}
