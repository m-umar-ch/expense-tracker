import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

interface DonationSectionProps {
  onGetStarted: () => void;
}

const DonationSection: React.FC<DonationSectionProps> = ({ onGetStarted }) => {
  return (
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
              {[].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-yellow-400" />
                  <span className="font-bold text-white uppercase text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <Button
              onClick={onGetStarted}
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
              {[].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-black" />
                  <span className="font-bold uppercase text-sm text-black">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <Button
              onClick={onGetStarted}
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
              {[].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-white" />
                  <span className="font-bold uppercase text-white text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <Button
              onClick={onGetStarted}
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
  );
};

export default DonationSection;
