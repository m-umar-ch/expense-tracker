import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-6xl lg:text-8xl font-black uppercase leading-none mb-8">
              TRACK
              <br />
              YOUR
              <br />
              <span className="text-red-500 block transform -rotate-2 bg-black border-4 border-red-500 px-4">
                MONEY
              </span>
            </h2>
            <p className="text-xl font-bold uppercase tracking-wide mb-8 text-gray-300">
              NO BS. NO FLUFF. JUST BRUTAL EFFICIENCY.
            </p>
            <div className="space-y-4 mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-red-500"></div>
                <span className="font-bold uppercase">TRACK EVERY RUPEE</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-red-500"></div>
                <span className="font-bold uppercase">CRUSH YOUR BUDGETS</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-red-500"></div>
                <span className="font-bold uppercase">EXPORT RAW DATA</span>
              </div>
            </div>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-widest px-12 py-6 text-xl transform hover:scale-105 transition-all duration-200 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              START TRACKING
              <ChevronRight className="ml-2 w-6 h-6" />
            </Button>
          </div>

          <div className="relative">
            <div className="bg-red-500 p-8 transform rotate-3 border-4 border-black">
              <div className="bg-black p-6 transform -rotate-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-red-500 pb-2">
                    <span className="font-bold uppercase">EXPENSES</span>
                    <span className="font-black text-red-500">$2,500</span>
                  </div>
                  <div className="flex justify-between items-center border-b-2 border-white pb-2">
                    <span className="font-bold uppercase">BUDGET</span>
                    <span className="font-black">$3,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">SAVED</span>
                    <span className="font-black text-green-400">$500</span>
                  </div>
                  <div className="flex justify-between items-center border-b-2 border-white pb-2">
                    <span className="font-bold uppercase">BUDGET</span>
                    <span className="font-black">$3,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">SAVED</span>
                    <span className="font-black text-green-400">$500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">SAVED</span>
                    <span className="font-black text-green-400">₹5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
