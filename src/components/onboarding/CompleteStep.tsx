import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { CheckCircle2, Sparkles, Glasses, Target } from "lucide-react";

interface CompleteStepProps {
  onComplete: () => void;
}

interface FramePreferences {
  faceShape?: string;
  frameStyle?: string[];
  colors?: string[];
  usage?: string[];
  budget?: string;
}

interface FaceDimensions {
  faceWidthMm?: number;
  pupillaryDistanceMm?: number;
  bridgeWidthMm?: number;
  templeWidthMm?: number;
  faceShape?: string;
}

export const CompleteStep = ({ onComplete }: CompleteStepProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const preferences = profile?.frame_preferences as FramePreferences | null;
  const faceDimensions = profile?.face_dimensions as FaceDimensions | null;

  const hasPreferences = preferences && Object.keys(preferences).length > 0;
  const hasMeasurements = faceDimensions && Object.keys(faceDimensions).length > 0;

  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          You're All Set!
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your personalized eyewear experience is ready. We've saved your preferences and measurements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-xl mx-auto">
        {hasMeasurements && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium">Face Measurements</h3>
              <p className="text-sm text-muted-foreground">
                {faceDimensions?.faceShape && (
                  <span className="capitalize">{faceDimensions.faceShape} face shape</span>
                )}
                {faceDimensions?.pupillaryDistanceMm && (
                  <span> • PD: {faceDimensions.pupillaryDistanceMm}mm</span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {hasPreferences && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-medium">Style Profile</h3>
              <p className="text-sm text-muted-foreground">
                {preferences?.frameStyle?.slice(0, 2).join(", ")}
                {preferences?.colors?.length ? ` • ${preferences.colors.length} colors` : ""}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-primary/5 rounded-xl p-6 max-w-md mx-auto">
        <Glasses className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="font-medium text-lg mb-2">Ready to Explore</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Browse our collection and see personalized recommendations based on your profile.
        </p>
      </div>

      <div className="pt-4">
        <Button onClick={onComplete} size="lg" variant="hero" className="px-8">
          <Glasses className="mr-2 h-5 w-5" />
          View My Recommendations
        </Button>
      </div>
    </div>
  );
};
