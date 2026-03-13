import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";

export const VirtualTryOnBanner = () => {
  return (
    <Card className="mt-16 gradient-gold overflow-hidden">
      <CardContent className="p-8 sm:p-12 text-center space-y-4">
        <Camera className="h-16 w-16 mx-auto text-accent-foreground" />
        <h2 className="text-3xl font-display font-bold text-accent-foreground">
          Try Before You Buy
        </h2>
        <p className="text-accent-foreground/90 max-w-2xl mx-auto">
          Upload your photo and see how any frame looks on your face with our
          AI-powered try-on technology
        </p>
        <Button variant="secondary" size="lg" asChild>
          <Link to="/try-on">Start Virtual Try-On</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
