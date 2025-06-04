
"use client";

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image'; // Keep next/image for optimized images
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ImageComparer } from './ImageComparer';
import { UploadCloud, Download, Sparkles, Info, Loader2, Copy, HelpCircle, ImagePlay, LogOut, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateImageName, type GenerateImageNameInput } from '@/ai/flows/generate-image-name';
import { getImageMetadata, convertToWebP, formatBytes, type ImageMetadata, type WebPConversionResult } from '@/lib/imageUtils';
import { logout } from '@/lib/auth';

export default function ConversionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<ImageMetadata | null>(null);
  const [convertedImage, setConvertedImage] = useState<WebPConversionResult | null>(null);
  const [prefix, setPrefix] = useState('');
  const [finalName, setFinalName] = useState('your-awesome-image.webp');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionQuality, setCompressionQuality] = useState(90); // 5-100
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast({ title: 'Tipo de archivo no válido', description: 'Por favor, sube una imagen JPG, JPEG o PNG.', variant: 'destructive' });
        setSelectedFile(null);
        setOriginalImage(null);
        setConvertedImage(null);
        setFinalName('your-awesome-image.webp');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setConvertedImage(null);
      setFinalName('your-awesome-image.webp'); 
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
    setFinalName('Generando nombre...');

    try {
      // Pass quality as 0-1 range
      const webpResult = await convertToWebP(originalImage, { quality: compressionQuality / 100, targetMaxKB: 800, targetWidth: 1920 });
      setConvertedImage(webpResult);
      toast({ title: 'Conversión Exitosa', description: `Imagen convertida a WebP (${formatBytes(webpResult.sizeBytes)}).` });

      const aiInput: GenerateImageNameInput = { photoDataUri: originalImage.dataUrl };
      const aiOutput = await generateImageName(aiInput);
      
      let generatedName = aiOutput.filename;
      if (prefix.trim()) {
        generatedName = `${prefix.trim().toLowerCase().replace(/\s+/g, '-')}-${generatedName}`;
      }
      const completeFinalName = `${generatedName}.webp`;
      setFinalName(completeFinalName);

      toast({ title: 'Nombre Generado por IA', description: `Sugerencia: ${completeFinalName}` });

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      console.error("Conversion/Naming Error:", e);
      toast({ title: 'Error en el Proceso', description: errorMsg, variant: 'destructive' });
      setError(errorMsg);
      setConvertedImage(null);
      setFinalName('error-al-generar.webp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedImage?.dataUrl || !finalName || finalName.includes("Generando") || finalName.includes("error")) {
      toast({ title: 'Error de Descarga', description: 'No hay imagen convertida válida para descargar.', variant: 'destructive' });
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

  const handleCopyName = () => {
    if (finalName && !finalName.includes("Generando") && !finalName.includes("error")) {
      navigator.clipboard.writeText(finalName)
        .then(() => toast({ title: 'Nombre Copiado', description: `${finalName} copiado al portapapeles.` }))
        .catch(err => toast({ title: 'Error al Copiar', description: 'No se pudo copiar el nombre.', variant: 'destructive' }));
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    router.push('/login');
  };

  const handleClear = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setConvertedImage(null);
    setPrefix('');
    setFinalName('your-awesome-image.webp');
    setError(null);
    setCompressionQuality(90); // Reset to default
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
    toast({ title: 'Formulario Limpiado', description: 'Puedes subir una nueva imagen.' });
  };
  
  const reductionPercentage = originalImage && convertedImage 
    ? Math.round((1 - convertedImage.sizeBytes / originalImage.sizeBytes) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <ImagePlay className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-semibold">Zoe Convert</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <HelpCircle className="mr-1 h-4 w-4" /> Help
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
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
              <CardTitle className="text-xl font-semibold">Convert Your Images to Smart WebP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                onClick={triggerFileInput}
                className="mt-1 flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed border-primary/40 hover:border-primary cursor-pointer bg-background/30 transition-colors"
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-card-foreground">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">JPG, JPEG, or PNG</p>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>
              
              <div>
                <Label htmlFor="prefix" className="text-xs font-medium text-muted-foreground">Optional file name prefix</Label>
                <Input
                  id="prefix"
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g., product-image-"
                  className="mt-1 bg-input text-foreground border-border focus:bg-background placeholder:text-muted-foreground/70"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="compressionQuality" className="text-xs font-medium text-muted-foreground">
                    WebP Quality Level
                  </Label>
                  <span className="text-sm font-semibold text-primary">{compressionQuality}%</span>
                </div>
                <Slider
                  id="compressionQuality"
                  min={5}
                  max={100}
                  step={1}
                  value={[compressionQuality]}
                  onValueChange={(value) => setCompressionQuality(value[0])}
                  className="w-full [&>span:last-child]:bg-primary [&>span:last-child]:border-primary-foreground"
                  aria-label="WebP compression quality"
                />
                <p className="text-xs text-muted-foreground mt-1">Lower values mean smaller files but lower quality.</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleConvert} disabled={isLoading || !selectedFile} className="flex-grow font-semibold py-3 text-base">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Processing...' : 'Convert and Analyze'}
                </Button>
                <Button onClick={handleClear} variant="outline" className="font-semibold py-3 text-base" disabled={!selectedFile && !originalImage && !convertedImage}>
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Image Comparer & Results */}
          <div className="space-y-6">
            <Card className="shadow-lg bg-card text-card-foreground">
              <CardHeader>
                  <CardTitle className="text-xl font-semibold">Conversion Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="finalName" className="text-xs font-medium text-muted-foreground">Suggested File Name (by Gemini)</Label>
                  <div className="relative mt-1">
                    <Input
                      id="finalName"
                      type="text"
                      value={finalName}
                      readOnly
                      className="pr-10 bg-input text-foreground border-border placeholder:text-muted-foreground/70"
                      aria-label="Suggested file name"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={handleCopyName}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                      aria-label="Copy file name"
                      disabled={finalName.includes("Generando") || finalName.includes("error")}
                    >
                      <Copy className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>

                <ImageComparer
                  originalSrc={originalImage?.dataUrl}
                  convertedSrc={convertedImage?.dataUrl}
                  originalAlt={originalImage?.name || "Original image placeholder"}
                  convertedAlt={finalName || "Converted image placeholder"}
                  aspectRatio={originalImage ? `${originalImage.width}/${originalImage.height}` : "3/2"}
                />
                
                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality Setting:</span>
                    <span className="font-medium">{compressionQuality}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Size:</span>
                    <span className="font-medium">{originalImage ? formatBytes(originalImage.sizeBytes) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Converted Size:</span>
                    <span className="font-medium">{convertedImage ? formatBytes(convertedImage.sizeBytes) : '-'}</span>
                  </div>
                  <div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Size Reduction:</span>
                        <span className="font-medium">{reductionPercentage}%</span> 
                    </div>
                    <Progress 
                        value={reductionPercentage} 
                        className="h-2 mt-1 bg-primary/20" 
                        aria-label="Image size reduction percentage"
                    />
                  </div>
                </div>

              </CardContent>
              <CardFooter>
                <Button onClick={handleDownload} className="w-full font-semibold py-3 text-base" variant="default" disabled={!convertedImage || isLoading || finalName.includes("Generando") || finalName.includes("error")}>
                  <Download className="mr-2 h-5 w-5" />
                  Download WebP Image
                </Button>
              </CardFooter>
            </Card>
            
            {error && (
              <Alert variant="destructive" className="mt-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-background border-t border-border text-center py-4 mt-auto">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Zoe Convert. All rights reserved.</p>
      </footer>
    </div>
  );
}

