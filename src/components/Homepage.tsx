import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ChevronRight,
  DollarSign,
  BarChart3,
  Shield,
  Zap,
  Check,
  X,
  Crown,
} from "lucide-react";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const handleGetStarted = () => {
    if (loggedInUser) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const getButtonText = () => {
    if (loggedInUser === undefined) return "LOADING...";
    return loggedInUser ? "GO TO DASHBOARD" : "GET STARTED FREE";
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-x-hidden">
      {/* Raw geometric noise background */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,0,0,0.1) 10px, rgba(255,0,0,0.1) 12px)
          `,
          }}
        />
      </div>

      {/* Brutal header */}
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
            <Button
              onClick={handleGetStarted}
              className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-8 py-3 transform hover:scale-105 transition-transform border-2 border-black"
            >
              {loggedInUser ? "DASHBOARD" : "LOGIN"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section - Aggressive and bold */}
      <main className="relative z-10">
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
                    <span className="font-bold uppercase">
                      TRACK EVERY RUPEE
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-red-500"></div>
                    <span className="font-bold uppercase">
                      CRUSH YOUR BUDGETS
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-red-500"></div>
                    <span className="font-bold uppercase">EXPORT RAW DATA</span>
                  </div>
                </div>
                <Button
                  onClick={handleGetStarted}
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
                        <span className="font-black text-green-400">
                          ₹5,000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section - Raw and minimal */}
        {/* <section className="py-20 bg-red-500 border-y-8 border-black">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-4xl font-black uppercase text-center mb-16 text-black">
              RAW POWER FEATURES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: BarChart3, title: "ANALYTICS", desc: "BRUTAL CHARTS" },
                { icon: Shield, title: "SECURITY", desc: "LOCKED DOWN" },
                { icon: Zap, title: "SPEED", desc: "LIGHTNING FAST" },
                { icon: DollarSign, title: "TRACKING", desc: "EVERY PENNY" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-black border-4 border-black p-6 transform hover:scale-105 transition-transform"
                >
                  <feature.icon className="w-12 h-12 text-red-500 mb-4" />
                  <h4 className="text-xl font-black uppercase mb-2">
                    {feature.title}
                  </h4>
                  <p className="font-bold uppercase text-sm text-gray-300">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Free Forever Section */}
        <section className="relative z-10 py-24 bg-red-500 border-y-8 border-black">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-8 text-black transform -rotate-2">
              100% FREE FOREVER
            </h2>
            <div className="bg-black border-4 border-black p-8 transform rotate-1">
              <p className="text-2xl md:text-3xl font-black mb-4 text-white">
                COMPLETELY FREE!
              </p>
              <p className="text-lg font-bold uppercase tracking-wider text-red-500 mb-8">
                NO ADS • NO LIMITS • NO BULLSHIT • NO SUBSCRIPTION
              </p>
            </div>
            <p className="text-xl font-bold uppercase tracking-wide mb-8 text-white">
              BUILT FOR THE PEOPLE, BY THE PEOPLE
            </p>
            <p className="text-lg font-bold uppercase tracking-wide mb-12 text-white/95">
              TRACK UNLIMITED EXPENSES • ALL FEATURES UNLOCKED
            </p>
          </div>
        </section>

        {/* Donation Support Section */}
        <section className="py-20 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-black uppercase mb-4 text-black">
                SUPPORT THE PROJECT
              </h3>
              <p className="text-xl font-bold uppercase text-red-500">
                HELP KEEP IT FREE FOR EVERYONE
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coffee Donation */}
              <div className="bg-black border-4 border-red-500 p-8 transform hover:scale-105 transition-transform">
                <div className="bg-yellow-400 text-black px-4 py-2 font-black uppercase text-center mb-6">
                  ☕ BUY ME COFFEE
                </div>
                <h4 className="text-2xl font-black uppercase mb-2 text-red-500">
                  COFFEE
                </h4>
                <div className="text-6xl font-black mb-6 text-white">
                  $5<span className="text-lg">/ONCE</span>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    // "KEEP DEVELOPER CAFFEINATED",
                    // "SHOW APPRECIATION",
                    // "QUICK & SIMPLE",
                    // "EVERY DOLLAR COUNTS",
                    // "COMMUNITY LOVE",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-6 h-6 text-yellow-400" />
                      <span className="font-bold text-white uppercase text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase py-4"
                >
                  DONATE $5
                </Button>
              </div>

              {/* MEAL Donation */}
              <div className="bg-red-500 border-4 border-black p-8 transform hover:scale-105 transition-transform relative">
                <div className="absolute -top-4 -right-4 bg-black text-red-500 px-4 py-2 font-black uppercase rotate-12">
                  POPULAR
                </div>
                <div className="bg-orange-400 text-black px-4 py-2 font-black uppercase text-center mb-6">
                  🍲 BUY ME MEAL
                </div>
                <h4 className="text-2xl font-black uppercase mb-2 text-black">
                  MEAL
                </h4>
                <div className="text-6xl font-black mb-6 text-black">
                  $25<span className="text-lg">/serving</span>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    // "FUEL LATE NIGHT CODING",
                    // "SUPPORT DEVELOPMENT",
                    // "HELP PAY SERVER COSTS",
                    // "FEATURE PRIORITY VOTE",
                    // "DISCORD VIP ACCESS",
                    // "ETERNAL GRATITUDE",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-6 h-6 text-black" />
                      <span className="font-bold uppercase text-sm text-black">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-black hover:bg-gray-800 text-red-500 font-black uppercase py-4"
                >
                  DONATE $25
                </Button>
              </div>

              {/* Sponsor Donation */}
              <div className="bg-black border-4 border-white p-8 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-center space-x-2 bg-white text-black px-4 py-2 font-black uppercase text-center mb-6">
                  <Crown className="w-5 h-5" />
                  <span>SPONSOR</span>
                </div>
                <h4 className="text-2xl font-black uppercase mb-2 text-white">
                  SPONSOR
                </h4>
                <div className="text-6xl font-black mb-6 text-white">
                  $100<span className="text-lg">+</span>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    // "LOGO ON WEBSITE",
                    // "FEATURE REQUESTS",
                    // "DIRECT DEV ACCESS",
                    // "MONTHLY UPDATES",
                    // "TAX DEDUCTIBLE",
                    // "COMPANY RECOGNITION",
                    // "SUPPORTER BADGE",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-6 h-6 text-white" />
                      <span className="font-bold uppercase text-white text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-white hover:bg-gray-200 text-black font-black uppercase py-4"
                >
                  BECOME SPONSOR
                </Button>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-xl font-bold uppercase tracking-wide text-red-500 mb-4">
                YOUR DONATIONS KEEP THIS FREE
              </p>
              <p className="text-lg font-bold uppercase tracking-wide text-gray-600">
                NO CORPORATE OVERLORDS • JUST COMMUNITY SUPPORT
              </p>
            </div>
          </div>
        </section>

        {/* CTA section */}
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
                onClick={handleGetStarted}
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
      </main>

      {/* Footer - Minimal and harsh */}
      <footer className="border-t-4 border-red-500 bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold uppercase tracking-widest text-gray-500">
            © 2026 EXPENSETRACK - FREE FOREVER • NO SUBSCRIPTIONS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
