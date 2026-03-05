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
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-primary-foreground font-bold" />
              </div>
              <h1 className="text-xl font-black tracking-tight flex items-center">
                EXPENSE<span className="text-primary">TRACK</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold uppercase tracking-widest text-muted-foreground border">
                  PRO
                </span>
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="gap-2 font-bold"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">SETTINGS</span>
              </Button>
              <Button
                onClick={onGetStarted}
                size="sm"
                className="font-bold px-6 shadow-lg shadow-primary/20"
              >
                {loggedInUser ? "DASHBOARD" : "ACCESS ACCOUNT"}
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
