import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

interface DonationSectionProps {
  onGetStarted: () => void;
}

const DonationSection: React.FC<DonationSectionProps> = ({}) => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h3 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            SUPPORT THE <span className="text-primary italic">MISSION.</span>
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We are community-driven and independent. Your support helps us keep
            the servers running and the code open source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coffee Donation */}
          <div className="group p-8 rounded-3xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                ☕
              </div>
              <h4 className="text-xl font-bold">Coffee</h4>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black">
                $5
                <span className="text-sm text-muted-foreground font-medium">
                  /once
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep the developer caffeinated.
              </p>
            </div>
            <Button className="w-full rounded-xl font-bold" variant="secondary">
              Donate $5
            </Button>
          </div>

          {/* MEAL Donation */}
          <div className="relative group p-8 rounded-3xl border-2 border-primary bg-primary/5 backdrop-blur-sm hover:bg-primary/10 transition-all space-y-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                🍲
              </div>
              <h4 className="text-xl font-bold">Hot Meal</h4>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black">
                $25
                <span className="text-sm text-muted-foreground font-medium">
                  /serving
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fuel the next big feature update.
              </p>
            </div>
            <Button className="w-full rounded-xl font-bold shadow-lg shadow-primary/20">
              Donate $25
            </Button>
          </div>

          {/* Sponsor Donation */}
          <div className="group p-8 rounded-3xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold">Sponsor</h4>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black">
                $100
                <span className="text-sm text-muted-foreground font-medium">
                  +
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Become a permanent part of our community.
              </p>
            </div>
            <Button className="w-full rounded-xl font-bold" variant="outline">
              Become a Sponsor
            </Button>
          </div>
        </div>

        <div className="text-center mt-16 pt-8 border-t space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
            No Corporate Overlords • 100% Independent
          </p>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
