import React, { useState } from "react";
import { Shield, EyeOff, Eye, Lock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PrivacySection: React.FC = () => {
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(true);

  // Dummy data for the preview card
  const dummyTransactions = [
    { name: "Salary Deposit", amount: "+$4,500.00", type: "income", color: "text-green-500" },
    { name: "Rent Payment", amount: "-$1,200.00", type: "expense", color: "text-destructive" },
    { name: "Investment Dividend", amount: "+$245.50", type: "income", color: "text-green-500" },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <div className="space-y-8 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            Privacy Mode
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
              PUBLIC SPACE?<br />
              <span className="text-primary italic">NO PROBLEM.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              We know you manage your money on the go. Enable <strong className="text-foreground italic">No-Bullshit Mode</strong> to instantly blur all sensitive figures and transaction names. 
            </p>
          </div>

          <ul className="space-y-4">
            {[
              "Instantly hide balances in coffee shops",
              "Safe for screen-sharing and presentations",
              "Toggle with a single click (or press 'S')",
              "Complete control over what remains visible"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Button 
              size="lg" 
              onClick={() => setIsPrivacyEnabled(!isPrivacyEnabled)}
              className="gap-2 font-black rounded-full shadow-lg shadow-primary/20 group"
            >
              {isPrivacyEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isPrivacyEnabled ? "See Real Numbers" : "Test Privacy Blur"}
              {/* <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" /> */}
            </Button>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative z-10 p-4 sm:p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent pointer-events-none" />
            
            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black">Financial Overview</h3>
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-tighter">Live Preview</p>
                </div>
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-500",
                  isPrivacyEnabled ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"
                )}>
                  {isPrivacyEnabled ? <Lock className="w-5 h-5" /> : <Lock className="w-5 h-5 opacity-20" />}
                </div>
              </div>

              <div className="space-y-4">
                {dummyTransactions.map((tx, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 hover:bg-muted/40 cursor-pointer transition-all rounded-xl"
                    onClick={() => setIsPrivacyEnabled(!isPrivacyEnabled)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border border-background shadow-sm shrink-0",
                        tx.type === "income" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                      )}>
                        {tx.name.charAt(0)}
                      </div>
                      <div>
                        <p className={cn(
                          "font-bold text-sm transition-all duration-500",
                          isPrivacyEnabled && "blur-md select-none opacity-50"
                        )}>
                          {tx.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{tx.type}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-right font-black transition-all duration-500",
                      tx.color,
                      isPrivacyEnabled && "blur-lg select-none"
                    )}>
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Privacy Guard</span>
                  <Badge variant={isPrivacyEnabled ? "default" : "secondary"} className="text-[10px] font-black uppercase px-2 transition-all">
                    {isPrivacyEnabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
