import { TopBar } from "./navigation/TopBar";
import { MainNav } from "./navigation/MainNav";
import { MobileTopBar } from "./navigation/MobileTopBar";
import { MobileBottomNav } from "./navigation/MobileBottomNav";
import { SearchStrip } from "./navigation/SearchStrip";

export const Navigation = () => {
  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <TopBar />
          <MainNav />
        </div>
        
        {/* Mobile Top Bar */}
        <MobileTopBar />

        {/* Search Strip — visible on all sizes */}
        <SearchStrip />
      </header>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
};
