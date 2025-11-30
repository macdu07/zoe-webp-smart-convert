import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Download, Info } from "lucide-react";
import { ImageComparer } from "./ImageComparer";
import {
  formatBytes,
  type ImageMetadata,
  type WebPConversionResult,
} from "@/lib/imageUtils";
import { useToast } from "@/hooks/use-toast";

interface ConversionResultProps {
  originalImage: ImageMetadata | null;
  convertedImage: WebPConversionResult | null;
  finalName: string;
  compressionQuality: number;
  isLoading: boolean;
  error: string | null;
  useAiForName: boolean;
}

export function ConversionResult({
  originalImage,
  convertedImage,
  finalName,
  compressionQuality,
  isLoading,
  error,
  useAiForName,
}: ConversionResultProps) {
  const { toast } = useToast();

  const handleCopyName = () => {
    if (
      finalName &&
      !finalName.includes("Generando") &&
      !finalName.includes("error")
    ) {
      navigator.clipboard
        .writeText(finalName)
        .then(() =>
          toast({
            title: "Nombre Copiado",
            description: `${finalName} copiado al portapapeles.`,
          })
        )
        .catch((err) =>
          toast({
            title: "Error al Copiar",
            description: "No se pudo copiar el nombre.",
            variant: "destructive",
          })
        );
    }
  };

  const handleDownload = () => {
    if (
      !convertedImage?.dataUrl ||
      !finalName ||
      finalName.includes("Generando") ||
      finalName.includes("error")
    ) {
      toast({
        title: "Error de Descarga",
        description: "No hay imagen convertida válida para descargar.",
        variant: "destructive",
      });
      return;
    }
    const link = document.createElement("a");
    link.href = convertedImage.dataUrl;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Descarga Iniciada",
      description: `Descargando ${finalName}`,
    });
  };

  const reductionPercentage =
    originalImage && convertedImage
      ? Math.round(
          (1 - convertedImage.sizeBytes / originalImage.sizeBytes) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Conversion result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="finalName"
              className="text-xs font-medium text-muted-foreground"
            >
              {useAiForName ? "Suggested File Name (by Gemini)" : "File Name"}
            </Label>
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
                disabled={
                  finalName.includes("Generando") || finalName.includes("error")
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ImageComparer
            original={originalImage?.dataUrl}
            converted={convertedImage?.dataUrl}
            aspectRatio={
              originalImage
                ? `${originalImage.width}/${originalImage.height}`
                : "3/2"
            }
          />

          <div className="space-y-2 text-sm pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality Setting:</span>
              <span className="font-medium">{compressionQuality}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Size:</span>
              <span className="font-medium">
                {originalImage ? formatBytes(originalImage.sizeBytes) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Converted Size:</span>
              <span className="font-medium">
                {convertedImage ? formatBytes(convertedImage.sizeBytes) : "-"}
              </span>
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
          <Button
            onClick={handleDownload}
            className="w-full font-semibold py-3 text-base"
            variant="default"
            disabled={
              !convertedImage ||
              isLoading ||
              finalName.includes("Generando") ||
              finalName.includes("error")
            }
          >
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
  );
}
