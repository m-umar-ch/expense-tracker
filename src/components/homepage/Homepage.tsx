import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Header from "./Header";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import PrivacySection from "./PrivacySection";
import FreeForeverSection from "./FreeForeverSection";
import DonationSection from "./DonationSection";
import CTASection from "./CTASection";
import Footer from "./Footer";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.users.currentUser);

  const handleGetStarted = () => {
    if (loggedInUser) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const getButtonText = () => {
    if (loggedInUser === undefined) return "Loading...";
    return loggedInUser ? "Go to Dashboard" : "Get Started Free";
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <Header loggedInUser={loggedInUser} onGetStarted={handleGetStarted} />

      <main className="relative z-10">
        <HeroSection onGetStarted={handleGetStarted} />
        {/* <FeaturesSection /> */}
        <PrivacySection />
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
