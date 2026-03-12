import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
  getButtonText: () => string;
}

const CTASection: React.FC<CTASectionProps> = ({
  onGetStarted,
  getButtonText,
}) => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="rounded-[2.5rem] border border-primary/20 bg-linear-to-b from-card/80 to-background/80 backdrop-blur-3xl p-8 md:p-20 text-center space-y-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]" />

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-inner mb-4">
              <Sparkles className="w-3 h-3" />
              Limited Beta Access
            </div>
            
            <h3 className="text-3xl md:text-6xl font-black tracking-tight leading-[0.9] text-foreground">
              READY TO 
              <span className="text-primary italic">ASCEND?</span>
            </h3>
            
            <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Stop guessing where your money goes. Join thousands of users who take their financial <span className="text-foreground font-black">sovereignty</span> seriously.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-2">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-[0.98] transition-all group/btn"
            >
              {getButtonText()}
              <ArrowRight className="ml-2 w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trusted by users at</span>
              <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                <span className="font-black italic text-lg tracking-tighter">TECH.</span>
                <span className="font-black text-lg tracking-tighter">CORP</span>
                <span className="font-black italic text-lg tracking-tighter">FINANCE</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap justify-center gap-8 border-t border-border/40 mt-6">
            {[
              "Instant Setup",
              "Private by Default",
              "100% Free Forever"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
