import React from "react";

const FreeForeverSection: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-right" />
      <div className="max-w-5xl mx-auto px-4 relative z-10 text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-foreground">
          COMPLETELY <span className="text-primary italic">FREE.</span> FOREVER.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {[
            { label: "NO ADS", desc: "No annoying banners or popups ever." },
            {
              label: "NO LIMITS",
              desc: "Unlimted records, unlimited budgets.",
            },
            {
              label: "NO DATA SALES",
              desc: "Your data belongs to you, period.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-secondary/50 border backdrop-blur-sm space-y-2 hover:bg-secondary transition-colors"
            >
              <div className="text-2xl font-black text-primary tracking-tight">
                {item.label}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.3em] pt-12">
          Built with passion for the community
        </p>
      </div>
    </section>
  );
};

export default FreeForeverSection;
