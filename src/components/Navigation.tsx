import { TopBar } from "./navigation/TopBar";
import { MainNav } from "./navigation/MainNav";
import { MobileNav } from "./navigation/MobileNav";

export const Navigation = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Utility Bar - Desktop Only */}
      <div className="hidden lg:block">
        <TopBar />
      </div>
      
      {/* Main Navigation - Desktop */}
      <div className="hidden lg:block">
        <MainNav />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </header>
  );
};
