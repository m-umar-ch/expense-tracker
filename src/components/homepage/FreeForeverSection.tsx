import React from "react";

const FreeForeverSection: React.FC = () => {
  return (
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
  );
};

export default FreeForeverSection;
