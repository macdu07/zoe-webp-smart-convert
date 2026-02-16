import { useRef, useEffect, useMemo, type ChangeEvent, type DragEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";

interface ImageUploaderProps {
  selectedFiles: File[];
  onFilesSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onError: (msg: string) => void;
  onClear: () => void;
  maxFiles?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function ImageUploader({
  selectedFiles,
  onFilesSelect,
  onRemoveFile,
  onError,
  onClear,
  maxFiles = 10,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate object URLs for thumbnails and clean up on change
  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];
    for (const file of filesArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError(
          `El archivo "${file.name}" no es una imagen válida (JPG, JPEG, PNG).`,
        );
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > maxFiles) {
      onError(`Puedes subir un máximo de ${maxFiles} imágenes a la vez.`);
      onFilesSelect(validFiles.slice(0, maxFiles));
    } else if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    // Reset input value so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed cursor-pointer bg-background/30 transition-colors ${isDragging
            ? "border-primary bg-primary/10"
            : "border-primary/40 hover:border-primary"
          }`}
      >
        <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-card-foreground">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} imagen(es) seleccionada(s)`
            : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, or PNG (máx. {maxFiles} archivos)
        </p>
        <Input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png"
          multiple
          className="hidden"
        />
      </div>
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-border/60 hover:border-primary/50 transition-colors shadow-sm"
            >
              <img
                src={previewUrls[index]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-destructive shadow-md"
                title={`Quitar ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
