import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "./homepage/Header";
import HeroSection from "./homepage/HeroSection";
import FreeForeverSection from "./homepage/FreeForeverSection";
import DonationSection from "./homepage/DonationSection";
import CTASection from "./homepage/CTASection";
import Footer from "./homepage/Footer";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.getCurrentUser);

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

      <Header loggedInUser={loggedInUser} onGetStarted={handleGetStarted} />

      <main className="relative z-10">
        <HeroSection onGetStarted={handleGetStarted} />
        <FreeForeverSection />
        <DonationSection onGetStarted={handleGetStarted} />
        <CTASection
          onGetStarted={handleGetStarted}
          getButtonText={getButtonText}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
