import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TopBar = () => {
  return (
    <div className="bg-muted/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Left: Find a Store */}
          <Link 
            to="/branches" 
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Find a Store</span>
          </Link>

          {/* Center: Brand Text (visible on larger screens) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Free shipping on orders over ₦50,000</span>
          </div>

          {/* Right: Book an Eye Exam */}
          <Button variant="ghost" size="sm" asChild className="h-8 text-sm font-medium">
            <Link to="/booking" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Book an Eye Exam</span>
              <span className="sm:hidden">Book Exam</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
