"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  formatBytes,
  type ImageMetadata,
  type WebPConversionResult,
} from "@/lib/imageUtils";
import { useToast } from "@/hooks/use-toast";

export interface ConversionItem {
  id: string;
  originalFile: File;
  originalMetadata: ImageMetadata | null;
  convertedResult: WebPConversionResult | null;
  finalName: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

interface ConversionResultListProps {
  items: ConversionItem[];
  compressionQuality: number;
  useAiForName: boolean;
}

export function ConversionResultList({
  items,
  compressionQuality,
  useAiForName,
}: ConversionResultListProps) {
  const { toast } = useToast();

  const handleDownload = (item: ConversionItem) => {
    if (!item.convertedResult?.dataUrl || !item.finalName) {
      toast({
        title: "Error de Descarga",
        description: "No hay imagen convertida válida para descargar.",
        variant: "destructive",
      });
      return;
    }
    const link = document.createElement("a");
    link.href = item.convertedResult.dataUrl;
    link.download = item.finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Descarga Iniciada",
      description: `Descargando ${item.finalName}`,
    });
  };

  const handleDownloadAll = () => {
    const completedItems = items.filter(
      (item) => item.status === "done" && item.convertedResult?.dataUrl,
    );
    if (completedItems.length === 0) {
      toast({
        title: "No hay imágenes",
        description: "No hay imágenes convertidas para descargar.",
        variant: "destructive",
      });
      return;
    }
    completedItems.forEach((item, index) => {
      setTimeout(() => handleDownload(item), index * 200);
    });
  };

  const completedCount = items.filter((item) => item.status === "done").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const processingCount = items.filter(
    (item) => item.status === "processing",
  ).length;

  if (items.length === 0) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Conversion Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Sube imágenes y haz clic en "Convert" para ver los resultados aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">
            Conversion Results
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount}/{items.length} completadas
            {errorCount > 0 && ` • ${errorCount} errores`}
          </p>
        </div>
        {completedCount > 1 && (
          <Button
            onClick={handleDownloadAll}
            variant="outline"
            size="sm"
            disabled={processingCount > 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download All ({completedCount})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-md overflow-hidden bg-background flex-shrink-0">
              {item.convertedResult?.dataUrl ? (
                <img
                  src={item.convertedResult.dataUrl}
                  alt={item.finalName}
                  className="w-full h-full object-cover"
                />
              ) : item.originalMetadata?.dataUrl ? (
                <img
                  src={item.originalMetadata.dataUrl}
                  alt={item.originalFile.name}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <p
                className="text-sm font-medium truncate"
                title={item.finalName}
              >
                {item.status === "processing"
                  ? "Procesando..."
                  : item.status === "pending"
                    ? item.originalFile.name
                    : item.finalName}
              </p>
              {item.status === "done" &&
                item.originalMetadata &&
                item.convertedResult && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>
                      {formatBytes(item.originalMetadata.sizeBytes)} →{" "}
                      {formatBytes(item.convertedResult.sizeBytes)}
                    </span>
                    <span className="text-green-500 font-medium">
                      -
                      {Math.round(
                        (1 -
                          item.convertedResult.sizeBytes /
                            item.originalMetadata.sizeBytes) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                )}
              {item.status === "error" && (
                <p className="text-xs text-destructive mt-1">
                  {item.error || "Error desconocido"}
                </p>
              )}
              {item.status === "processing" && (
                <Progress value={50} className="h-1 mt-2" />
              )}
            </div>

            {/* Status Icon / Action */}
            <div className="flex-shrink-0">
              {item.status === "processing" && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {item.status === "done" && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDownload(item)}
                  className="h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {item.status === "error" && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {item.status === "pending" && (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
