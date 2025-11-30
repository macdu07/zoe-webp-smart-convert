import { useRef, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onError: (msg: string) => void;
  onClear: () => void;
}

export function ImageUploader({
  selectedFile,
  onFileSelect,
  onError,
  onClear,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        onError("Por favor, sube una imagen JPG, JPEG o PNG.");
        onClear();
        return;
      }
      onFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={triggerFileInput}
      className="mt-1 flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed border-primary/40 hover:border-primary cursor-pointer bg-background/30 transition-colors"
    >
      <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-card-foreground">
        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
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
  );
}
