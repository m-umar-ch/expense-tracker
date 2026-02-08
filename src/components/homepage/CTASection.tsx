import React from "react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onGetStarted: () => void;
  getButtonText: () => string;
}

const CTASection: React.FC<CTASectionProps> = ({
  onGetStarted,
  getButtonText,
}) => {
  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-5xl font-black uppercase mb-8">
          JOIN THE REVOLUTION
        </h3>
        <p className="text-xl font-bold uppercase tracking-wide mb-12 text-red-500">
          FREE FOREVER • NO SUBSCRIPTIONS • COMMUNITY DRIVEN
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-widest px-12 py-6 text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          >
            {getButtonText()}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-widest px-12 py-6 text-xl"
          >
            DONATE & SUPPORT
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
