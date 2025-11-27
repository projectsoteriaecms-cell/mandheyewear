import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles } from "lucide-react";

const TryOn = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
              <Camera className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              AI Try-On Preview
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your photo and see how different frames look on you instantly
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                    Upload Your Photo
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    For best results, use a clear front-facing photo with good lighting and minimal shadows.
                  </p>
                </div>

                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4 hover:border-primary transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer block">
                      <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG or HEIC (max. 10MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded preview" 
                        className="w-full h-auto"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setUploadedImage(null)}
                    >
                      Upload Different Photo
                    </Button>
                  </div>
                )}

                <div className="pt-6 border-t border-border space-y-3">
                  <h3 className="font-semibold text-foreground">Tips for best results:</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Face the camera directly</li>
                    <li>• Remove current glasses or sunglasses</li>
                    <li>• Use natural lighting when possible</li>
                    <li>• Keep hair away from face</li>
                    <li>• Maintain a neutral expression</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                    Try On Frames
                  </h2>
                  {!uploadedImage ? (
                    <div className="bg-muted/30 rounded-lg p-12 text-center space-y-4">
                      <Sparkles className="h-16 w-16 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Upload a photo to start trying on frames
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-subtle rounded-lg p-8 text-center space-y-4">
                        <Sparkles className="h-12 w-12 mx-auto text-accent animate-pulse" />
                        <div>
                          <p className="text-foreground font-medium mb-2">
                            AI Try-On Ready!
                          </p>
                          <p className="text-sm text-muted-foreground">
                            This feature will allow you to preview frames on your face
                          </p>
                        </div>
                      </div>

                      <Button variant="gold" className="w-full" size="lg">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Trying On Frames
                      </Button>

                      <div className="pt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          What happens next:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Browse our entire eyewear catalog</li>
                          <li>• See frames overlaid on your photo</li>
                          <li>• Compare multiple styles side-by-side</li>
                          <li>• Save favorites for later</li>
                          <li>• Share looks with friends or family</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-8 bg-gradient-subtle border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="max-w-3xl mx-auto space-y-4">
                <h3 className="text-xl font-display font-bold text-foreground">
                  About AI Try-On Technology
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI-powered virtual try-on uses advanced facial recognition and 3D modeling to accurately 
                  place eyewear on your photo. The technology accounts for face shape, proportions, and lighting 
                  to give you the most realistic preview possible.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">1000+</p>
                    <p className="text-sm text-muted-foreground">Frames Available</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-accent">95%</p>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">Instant</p>
                    <p className="text-sm text-muted-foreground">Results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TryOn;
