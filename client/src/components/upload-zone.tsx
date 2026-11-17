import { useCallback, useState } from "react";
import { Upload, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onImageSelect, isAnalyzing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          handleFile(file);
        }
      }
    },
    []
  );

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onImageSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        isDragging
          ? "border-primary border-2 bg-primary/5"
          : preview
          ? "border-solid"
          : "border-dashed border-2"
      } ${!preview ? "hover-elevate" : ""}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      data-testid="dropzone-upload"
    >
      <div className="min-h-64 p-5 sm:p-8 flex flex-col items-center justify-center">
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden="true" data-testid="icon-analyzing" />
            <p className="text-lg font-medium text-foreground" data-testid="text-analyzing">Analyzing verse...</p>
            <p className="text-sm text-muted-foreground max-w-sm" dir="rtl" data-testid="text-analyzing-urdu">
              جاری ہے تجزیہ... براہ کرم انتظار کریں
            </p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative w-full max-w-md rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Uploaded verse"
                className="w-full h-auto object-contain max-h-64"
                data-testid="img-uploaded-preview"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-primary" aria-hidden="true" data-testid="icon-uploaded" />
              <p className="text-sm font-medium text-foreground" data-testid="text-upload-success">Image uploaded</p>
              <p className="text-xs text-muted-foreground" data-testid="text-processing">Processing your request...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <div className="p-5 sm:p-6 rounded-full bg-primary/10">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-primary" aria-hidden="true" data-testid="icon-upload-zone" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground" data-testid="text-upload-title">
                Upload Quranic Verse Image
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm" dir="rtl" data-testid="text-upload-title-urdu">
                قرآنی آیت کی تصویر اپ لوڈ کریں
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-4" data-testid="text-upload-hint">
                Take a photo, browse files, or drag and drop an image here
              </p>
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileInput}
              disabled={isAnalyzing}
              data-testid="input-file-upload"
            />
            <input
              type="file"
              id="camera-upload"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              disabled={isAnalyzing}
              data-testid="input-camera-upload"
            />
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <label htmlFor="file-upload" className="w-full sm:w-auto">
                <Button
                  variant="default"
                  size="lg"
                  className="cursor-pointer w-full sm:w-auto gap-2"
                  asChild
                  data-testid="button-browse-file"
                >
                  <span>
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    Browse Files
                  </span>
                </Button>
              </label>
              <label htmlFor="camera-upload" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer w-full sm:w-auto gap-2"
                  asChild
                  data-testid="button-take-photo"
                >
                  <span>
                    <Camera className="w-4 h-4" aria-hidden="true" />
                    Take Photo
                  </span>
                </Button>
              </label>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
