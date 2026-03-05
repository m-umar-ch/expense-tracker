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
    <section className="py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
          READY TO TAKE THE <span className="italic">LEAP?</span>
        </h3>
        <p className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto">
          Join thousands of smart savers who have already taken control of their
          financial future with ExpenseTrack Pro.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={onGetStarted}
            size="lg"
            variant="secondary"
            className="h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition-transform"
          >
            {getButtonText()}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 px-12 text-xl font-bold rounded-2xl border-primary-foreground/40 bg-primary-foreground/10 hover:bg-primary-foreground/20 shadow-lg text-primary-foreground hover:text-primary-foreground"
          >
            JOIN COMMUNITY
          </Button>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.4em] opacity-60">
          No Credit Card Required • Setup in 30 Seconds
        </p>
      </div>
    </section>
  );
};

export default CTASection;
