import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Settings } from "lucide-react";
import SettingsModal from "../ui/SettingsModal";

interface HeaderProps {
  loggedInUser: any;
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ loggedInUser, onGetStarted }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <header className="relative z-10 border-b-4 border-red-500 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 flex items-center justify-center transform rotate-12">
                <DollarSign className="w-8 h-8 text-black font-bold" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                EXPENSE<span className="text-red-500">TRACK</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowSettingsModal(true)}
                className="bg-black border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-4 py-3 transform hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                SETTINGS
              </Button>
              <Button
                onClick={onGetStarted}
                className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-8 py-3 transform hover:scale-105 transition-transform border-2 border-black"
              >
                {loggedInUser ? "DASHBOARD" : "LOGIN"}
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
