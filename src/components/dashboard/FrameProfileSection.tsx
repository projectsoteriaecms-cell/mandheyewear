import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Sparkles, ChevronRight, CircleDashed, Scan, Ruler } from "lucide-react";

interface FramePreferences {
  faceShape?: string;
  frameStyle?: string[];
  colors?: string[];
  usage?: string[];
  budget?: string;
}

export const FrameProfileSection = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  
  const preferences = profile?.frame_preferences as FramePreferences | null;
  const hasPreferences = preferences && Object.keys(preferences).length > 0;

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
                <Link to="/style-quiz">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Take the Style Quiz
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
            Your Facial Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CircleDashed className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">Face Shape</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {preferences?.faceShape ? (
                  <span className="capitalize">{preferences.faceShape}</span>
                ) : (
                  "Use Virtual Try-On to detect"
                )}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">Pupillary Distance</p>
              </div>
              <p className="text-sm text-muted-foreground">Use Virtual Try-On to measure</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link to="/try-on">
                <Scan className="h-4 w-4 mr-2" />
                Use Virtual Try-On
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Fit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Your Fit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Frame Width</p>
              <p className="text-sm text-muted-foreground">
                Complete Virtual Try-On to calculate
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Best Bridge Fit</p>
              <p className="text-sm text-muted-foreground">
                Complete Virtual Try-On to calculate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
