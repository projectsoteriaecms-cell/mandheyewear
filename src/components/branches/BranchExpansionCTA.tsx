import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const BranchExpansionCTA = () => {
  return (
    <Card className="mt-16 gradient-hero overflow-hidden">
      <CardContent className="p-8 sm:p-12 text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-white">
          Can't Find a Nearby Location?
        </h2>
        <p className="text-white/90 max-w-2xl mx-auto">
          We're expanding! Contact us to learn about upcoming locations or to
          request a branch in your area.
        </p>
        <Button variant="secondary" size="lg">
          Contact Us
        </Button>
      </CardContent>
    </Card>
  );
};
