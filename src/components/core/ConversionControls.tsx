import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

interface ConversionControlsProps {
  useAiForName: boolean;
  setUseAiForName: (value: boolean) => void;
  prefix: string;
  setPrefix: (value: string) => void;
  language: "spanish" | "english";
  setLanguage: (value: "spanish" | "english") => void;
  compressionQuality: number;
  setCompressionQuality: (value: number) => void;
  onConvert: () => void;
  onClear: () => void;
  isLoading: boolean;
  hasFile: boolean;
  hasResult: boolean;
}

export function ConversionControls({
  useAiForName,
  setUseAiForName,
  prefix,
  setPrefix,
  language,
  setLanguage,
  compressionQuality,
  setCompressionQuality,
  onConvert,
  onClear,
  isLoading,
  hasFile,
  hasResult,
}: ConversionControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="use-ai-name"
          checked={useAiForName}
          onCheckedChange={setUseAiForName}
        />
        <Label htmlFor="use-ai-name" className="text-sm font-medium">
          Use AI for file name
        </Label>
      </div>

      <div>
        <Label
          htmlFor="prefix"
          className="text-xs font-medium text-muted-foreground"
        >
          {useAiForName
            ? "Optional file name prefix"
            : "Manual file name prefix"}
        </Label>
        <Input
          id="prefix"
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder={useAiForName ? "e.g., product-image-" : "your-file-name"}
          className="mt-1 bg-input text-foreground border-border focus:bg-background placeholder:text-muted-foreground/70"
        />
      </div>

      {useAiForName && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            AI filename language
          </Label>
          <Select
            value={language}
            onValueChange={(value: "spanish" | "english") => setLanguage(value)}
          >
            <SelectTrigger className="mt-1 bg-input text-foreground border-border focus:bg-background">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spanish">🇪🇸 Español</SelectItem>
              <SelectItem value="english">🇺🇸 English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs font-medium text-muted-foreground">
            WebP Quality Level
          </Label>
          <span className="text-sm font-semibold text-primary">
            {compressionQuality}%
          </span>
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
        <p className="text-xs text-muted-foreground mt-1">
          Lower values mean smaller files but lower quality.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onConvert}
          disabled={isLoading || !hasFile}
          className="flex-grow font-semibold py-3 text-base"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Processing..." : "Convert and Analyze"}
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="font-semibold py-3 text-base"
          disabled={!hasFile && !hasResult}
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
