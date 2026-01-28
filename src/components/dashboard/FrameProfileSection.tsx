import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Sparkles, ChevronRight, CircleDashed, Scan, Ruler, Check } from "lucide-react";

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
  confidenceScore?: number;
  scanDate?: string;
}

export const FrameProfileSection = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  
  const preferences = profile?.frame_preferences as FramePreferences | null;
  const faceDimensions = profile?.face_dimensions as FaceDimensions | null;
  const hasPreferences = preferences && Object.keys(preferences).length > 0;
  const hasMeasurements = faceDimensions && Object.keys(faceDimensions).length > 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Your Style Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPreferences ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Face Shape</p>
                  <Badge variant="secondary" className="capitalize">
                    {preferences.faceShape || "Not set"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preferred Styles</p>
                  <div className="flex flex-wrap gap-1">
                    {preferences.frameStyle?.map((style) => (
                      <Badge key={style} variant="outline" className="capitalize">
                        {style}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">Not set</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Budget Range</p>
                  <Badge variant="outline" className="capitalize">
                    {preferences.budget || "Not set"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preferred Colors</p>
                  <div className="flex flex-wrap gap-1">
                    {preferences.colors?.map((color) => (
                      <Badge key={color} variant="outline" className="capitalize">
                        {color}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">Not set</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Use</p>
                  <div className="flex flex-wrap gap-1">
                    {preferences.usage?.map((use) => (
                      <Badge key={use} variant="outline" className="capitalize">
                        {use}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">Not set</span>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Complete your style profile</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take our quick quiz to get personalized frame recommendations
              </p>
              <Button asChild>
                <Link to="/onboarding">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Personalization
                </Link>
              </Button>
            </div>
          )}
          
          {hasPreferences && (
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to="/style-quiz">
                  Retake Style Quiz
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facial Features from VTO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Your Face Measurements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasMeasurements ? (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Face Width</p>
                  <p className="text-xl font-semibold">
                    {faceDimensions.faceWidthMm ? `${faceDimensions.faceWidthMm}mm` : "—"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pupillary Distance (PD)</p>
                  <p className="text-xl font-semibold">
                    {faceDimensions.pupillaryDistanceMm ? `${faceDimensions.pupillaryDistanceMm}mm` : "—"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bridge Width</p>
                  <p className="text-xl font-semibold">
                    {faceDimensions.bridgeWidthMm ? `${faceDimensions.bridgeWidthMm}mm` : "—"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Face Shape</p>
                  <p className="text-xl font-semibold capitalize">
                    {faceDimensions.faceShape || "—"}
                  </p>
                </div>
              </div>
              
              {faceDimensions.confidenceScore !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    Measurement confidence: {Math.round(faceDimensions.confidenceScore * 100)}%
                  </span>
                  {faceDimensions.scanDate && (
                    <span className="ml-2">• Scanned on {formatDate(faceDimensions.scanDate)}</span>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/onboarding">
                    <Scan className="h-4 w-4 mr-2" />
                    Rescan Face
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CircleDashed className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">Face Shape</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete a face scan to detect your face shape
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">Pupillary Distance</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan your face to measure your PD
                </p>
              </div>
            </div>
          )}
          
          {!hasMeasurements && (
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link to="/onboarding">
                  <Scan className="h-4 w-4 mr-2" />
                  Scan Your Face
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Fit Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Your Fit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasMeasurements ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Recommended Frame Width</p>
                <p className="text-lg font-semibold">
                  {faceDimensions?.faceWidthMm 
                    ? `${faceDimensions.faceWidthMm - 5}mm - ${faceDimensions.faceWidthMm + 5}mm`
                    : "—"
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your face width measurement
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Recommended Bridge Size</p>
                <p className="text-lg font-semibold">
                  {faceDimensions?.bridgeWidthMm
                    ? `${faceDimensions.bridgeWidthMm - 2}mm - ${faceDimensions.bridgeWidthMm + 2}mm`
                    : "—"
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your bridge width measurement
                </p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Frame Width</p>
                <p className="text-sm text-muted-foreground">
                  Complete a face scan to calculate your ideal frame width
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Best Bridge Fit</p>
                <p className="text-sm text-muted-foreground">
                  Complete a face scan to calculate your ideal bridge size
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
