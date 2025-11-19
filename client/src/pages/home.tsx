import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { UploadZone } from "@/components/upload-zone";
import { IslamicPattern } from "@/components/islamic-pattern";
import { CloudUpload, Sparkles, BookOpen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { VerseAnalysis } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      return new Promise<VerseAnalysis>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = (reader.result as string).split(",")[1];
            const response = await apiRequest(
              "POST",
              "/api/analyze-verse",
              { imageBase64: base64 }
            );
            const result = await response.json();
            resolve(result as VerseAnalysis);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (data) => {
      setLocation(`/results?analysis=${encodeURIComponent(JSON.stringify(data))}`);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze the verse. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (file: File) => {
    analyzeMutation.mutate(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background">
          <IslamicPattern />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight" data-testid="text-app-title">
              Istikhara
            </h1>
            <p className="text-2xl md:text-3xl font-urdu font-medium text-foreground/90 leading-relaxed" dir="rtl" data-testid="text-app-title-urdu">
              قرآنی آیات کے ذریعے الہٰی رہنمائی
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4" data-testid="text-app-subtitle">
              Receive divine guidance through Quranic verses
            </p>
          </div>

          <div className="w-full max-w-md mt-8">
            <UploadZone
              onImageSelect={handleImageSelect}
              isAnalyzing={analyzeMutation.isPending}
            />
          </div>

          <p className="text-sm text-muted-foreground max-w-lg" data-testid="text-upload-instructions">
            Upload a clear photo of a Quranic verse and receive detailed spiritual interpretation in Urdu
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12 text-foreground" data-testid="heading-how-it-works">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center space-y-4 hover-elevate" data-testid="card-step-upload">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <CloudUpload className="w-8 h-8 text-primary" data-testid="icon-upload" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground" data-testid="text-step-upload-title">Upload</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-step-upload-desc">
                Take or upload a photo of the Quranic verse you wish to understand
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover-elevate" data-testid="card-step-analysis">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Sparkles className="w-8 h-8 text-primary" data-testid="icon-analysis" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground" data-testid="text-step-analysis-title">AI Analysis</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-step-analysis-desc">
                Our AI recognizes and analyzes the verse with deep contextual understanding
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover-elevate" data-testid="card-step-interpretation">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <BookOpen className="w-8 h-8 text-primary" data-testid="icon-interpretation" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground" data-testid="text-step-interpretation-title">Spiritual Interpretation</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-step-interpretation-desc">
                Receive detailed interpretation in Urdu including meaning, context, and guidance
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Istikhara Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-12 text-foreground" data-testid="heading-about">
              About Istikhara
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 space-y-4" data-testid="card-about-english">
                <h3 className="text-xl font-semibold text-foreground" data-testid="text-about-title-english">What is Istikhara?</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-about-desc-english">
                  Istikhara is the Islamic practice of seeking guidance from Allah when making decisions. 
                  Through prayer and reflection on Quranic verses, believers seek divine wisdom and clarity 
                  for their life choices.
                </p>
              </Card>
              <Card className="p-6 space-y-4" data-testid="card-about-urdu" dir="rtl">
                <h3 className="text-xl font-semibold font-urdu text-foreground text-right" data-testid="text-about-title-urdu">
                  استخارہ کیا ہے؟
                </h3>
                <p className="text-muted-foreground font-urdu leading-relaxed text-right" data-testid="text-about-desc-urdu">
                  استخارہ ایک اسلامی عمل ہے جس میں فیصلے کرتے وقت اللہ سے رہنمائی طلب کی جاتی ہے۔ 
                  دعا اور قرآنی آیات پر غور و فکر کے ذریعے، مومنین اپنی زندگی کے انتخاب کے لیے 
                  الہٰی حکمت اور وضاحت تلاش کرتے ہیں۔
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card/20 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-lg font-urdu text-foreground" dir="rtl" data-testid="text-footer-greeting">
              السلام علیکم ورحمۃ اللہ وبرکاتہ
            </p>
            <p className="text-sm text-muted-foreground" data-testid="text-footer-message">
              May this tool bring you closer to divine guidance
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-4">
              <span data-testid="text-footer-credit">Built with reverence and care</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
