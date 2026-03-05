import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative pt-16 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase animate-in fade-in slide-in-from-bottom-3 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Trusted by 10,000+ Smart Savers
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-foreground">
              MASTER YOUR <br />
              <span className="text-primary italic">FINANCES.</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              The ultimate "No-Bullshit" expense tracker. Clean code, private
              data, and brutal efficiency for those who take their money
              seriously.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                START TRACKING NOW
                <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
              <Button
                onClick={onGetStarted}
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-bold rounded-2xl border-2"
              >
                VIEW LIVE DEMO
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Open Source
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                No Ads
              </div>
            </div>
          </div>

          <div className="flex-1 relative group w-full lg:w-auto">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl p-3 shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-700 overflow-hidden">
              <img
                src="/hero-dashboard.png"
                alt="Expense Tracker Dashboard"
                className="rounded-2xl w-full h-auto shadow-inner"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="flex gap-4 w-full">
                  <div className="flex-1 h-32 rounded-xl bg-white/5 border border-white/10 backdrop-blur p-4 flex flex-col justify-end">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">
                      Savings Rate
                    </div>
                    <div className="text-xl font-black text-primary">82%</div>
                  </div>
                  <div className="flex-1 h-32 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur p-4 flex flex-col justify-end">
                    <div className="text-[10px] text-primary/70 font-bold uppercase">
                      Net Profits
                    </div>
                    <div className="text-xl font-black text-primary">
                      +$12.4k
                    </div>
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
