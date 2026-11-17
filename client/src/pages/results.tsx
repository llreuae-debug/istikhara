import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Home } from "lucide-react";
import type { VerseAnalysis } from "@shared/schema";

export default function Results() {
  const [, setLocation] = useLocation();
  
  // Get analysis data from URL query parameter or sessionStorage
  const searchParams = new URLSearchParams(window.location.search);
  const analysisParam = searchParams.get("analysis");

  let analysis: VerseAnalysis | null = null;
  try {
    if (analysisParam) {
      analysis = JSON.parse(decodeURIComponent(analysisParam)) as VerseAnalysis;
    } else {
      const stored = sessionStorage.getItem("istikhara:latestAnalysis");
      if (stored) {
        analysis = JSON.parse(stored) as VerseAnalysis;
      }
    }
  } catch {
    analysis = null;
  }

  if (!analysis) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-dvh bg-background pb-[env(safe-area-inset-bottom,0px)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur pt-[env(safe-area-inset-top,0px)]">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate" data-testid="heading-results-page">Spiritual Interpretation</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            aria-label="Go to home"
            data-testid="button-home"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Verse Display Section */}
          <Card className="p-5 sm:p-8 md:p-12 space-y-6 border-2">
            <div className="text-center space-y-2">
              {analysis.surahName && (
                <p className="text-sm font-medium text-muted-foreground" data-testid="text-verse-reference">
                  {analysis.surahName}
                  {analysis.verseNumber && ` - Verse ${analysis.verseNumber}`}
                </p>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <p
                className="text-3xl md:text-4xl lg:text-5xl font-arabic font-normal leading-loose text-foreground"
                dir="rtl"
                data-testid="text-arabic-verse"
              >
                {analysis.arabicText}
              </p>
            </div>

            {analysis.transliteration && (
              <>
                <Separator className="my-6" />
                <p className="text-center text-sm md:text-base text-muted-foreground italic leading-relaxed" data-testid="text-transliteration">
                  {analysis.transliteration}
                </p>
              </>
            )}
          </Card>

          {/* Interpretation Sections in Urdu */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-foreground mb-8" data-testid="heading-interpretation">
              Urdu Interpretation / اردو تفسیر
            </h2>

            {/* Literal Meaning */}
            <Card className="p-6 md:p-8 space-y-4" data-testid="card-literal-meaning">
              <div className="flex items-center justify-end gap-3">
                <h3 className="text-xl md:text-2xl font-urdu font-semibold text-foreground" data-testid="heading-literal-meaning">
                  لفظی معنی
                </h3>
                <div className="h-8 w-1 bg-primary rounded-full" />
              </div>
              <p
                className="text-base md:text-lg font-urdu leading-relaxed text-foreground/90"
                dir="rtl"
                data-testid="text-literal-meaning"
              >
                {analysis.urduInterpretation.literalMeaning}
              </p>
            </Card>

            {/* Background/Context */}
            <Card className="p-6 md:p-8 space-y-4" data-testid="card-background">
              <div className="flex items-center justify-end gap-3">
                <h3 className="text-xl md:text-2xl font-urdu font-semibold text-foreground" data-testid="heading-background">
                  پس منظر
                </h3>
                <div className="h-8 w-1 bg-primary rounded-full" />
              </div>
              <p
                className="text-base md:text-lg font-urdu leading-relaxed text-foreground/90"
                dir="rtl"
                data-testid="text-background"
              >
                {analysis.urduInterpretation.background}
              </p>
            </Card>

            {/* Spiritual Message - Highlighted */}
            <Card className="p-8 md:p-10 space-y-4 bg-primary/5 border-primary/20 border-2" data-testid="card-spiritual-message">
              <div className="flex items-center justify-end gap-3">
                <h3 className="text-xl md:text-2xl font-urdu font-semibold text-foreground" data-testid="heading-spiritual-message">
                  فال کے مطابق روحانی پیغام
                </h3>
                <div className="h-8 w-1 bg-primary rounded-full" />
              </div>
              <p
                className="text-lg md:text-xl font-urdu leading-relaxed text-foreground"
                dir="rtl"
                data-testid="text-spiritual-message"
              >
                {analysis.urduInterpretation.spiritualMessage}
              </p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
            <Button
              size="lg"
              onClick={() => setLocation("/")}
              className="w-full sm:w-auto px-8"
              data-testid="button-analyze-another"
            >
              Analyze Another Verse
            </Button>
          </div>

          {/* Timestamp */}
          {analysis.timestamp && (
            <p className="text-center text-xs text-muted-foreground pt-4" data-testid="text-timestamp">
              Analysis completed on {new Date(analysis.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-card/20 border-t mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-lg font-urdu text-foreground" dir="rtl" data-testid="text-results-footer-greeting">
              السلام علیکم ورحمۃ اللہ وبرکاتہ
            </p>
            <p className="text-sm text-muted-foreground" data-testid="text-results-footer-message">
              May this interpretation guide you on your spiritual journey
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
