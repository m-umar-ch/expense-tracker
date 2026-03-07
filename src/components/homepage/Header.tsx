import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Settings } from "lucide-react";
import SettingsModal from "../modals/SettingsModal";

interface HeaderProps {
  loggedInUser: any;
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ loggedInUser, onGetStarted }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-20">
          <div className="flex items-center justify-between h-full gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground font-bold" />
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center">
                <span className="hidden xs:inline">EXPENSE</span>
                <span className="text-primary">TRACK</span>
                <span className="hidden sm:inline ml-1.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold uppercase tracking-widest text-muted-foreground border">
                  PRO
                </span>
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="px-2 sm:px-3 gap-2 font-bold"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">
                  SETTINGS
                </span>
              </Button>
              <Button
                onClick={onGetStarted}
                size="sm"
                className="font-bold px-4 sm:px-6 shadow-lg shadow-primary/20 text-xs sm:text-sm"
              >
                {loggedInUser ? (
                  <>
                    <span className="hidden sm:inline">DASHBOARD</span>
                    <span className="sm:hidden">DASH</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">ACCESS ACCOUNT</span>
                    <span className="sm:hidden">LOGIN</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  );
};

export default Header;
