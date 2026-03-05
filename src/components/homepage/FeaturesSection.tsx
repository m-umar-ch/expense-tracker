import React from "react";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
  PieChart,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Real-time Analytics",
    description:
      "Get instant insights into your spending habits with dynamic charts and visual reports.",
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Privacy First",
    description:
      "Your financial data is encrypted and secure. We never sell your personal information.",
    icon: ShieldCheck,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Lightning Fast",
    description:
      "Built on top of Convex for real-time synchronization across all your devices.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Multi-Currency",
    description:
      "Support for all global currencies with custom symbol overrides and PKR support.",
    icon: Globe,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "Mobile Ready",
    description:
      "Fully responsive design that looks and works great on any screen size.",
    icon: Smartphone,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Budget Planning",
    description:
      "Set monthly limits per category and track your progress with smart alerts.",
    icon: PieChart,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            PRO POWER. <span className="text-primary">ZERO COST.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to master your money, packed into a clean,
            modern interface that respects your time and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all duration-300"
            >
              <CardContent className="p-8 space-y-4">
                <div
                  className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center group-hover:text-primary transition-colors">
                    {feature.title}
                    <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
