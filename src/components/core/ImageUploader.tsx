import { useRef, type ChangeEvent, type DragEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  selectedFiles: File[];
  onFilesSelect: (files: File[]) => void;
  onError: (msg: string) => void;
  onClear: () => void;
  maxFiles?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function ImageUploader({
  selectedFiles,
  onFilesSelect,
  onError,
  onClear,
  maxFiles = 10,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        className={`mt-1 flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed cursor-pointer bg-background/30 transition-colors ${
          isDragging
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
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
