import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DollarSign, Eye, EyeOff, ArrowLeft } from "lucide-react";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (loggedInUser) {
      navigate("/dashboard");
    }
  }, [loggedInUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual auth logic here
    // For now, redirect to dashboard
    navigate("/dashboard");
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
              onClick={() => navigate("/")}
              variant="outline"
              className="border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-6 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              BACK HOME
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Auth Form Container */}
          <div className="bg-red-500 p-2 border-4 border-black transform rotate-1">
            <div className="bg-black p-8 transform -rotate-1">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black uppercase mb-4">
                  {isLogin ? "LOGIN" : "SIGN UP"}
                </h2>
                <p className="text-lg font-bold uppercase tracking-wide text-gray-300">
                  {isLogin ? "GET BACK TO TRACKING" : "START TRACKING NOW"}
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex mb-8 border-4 border-red-500">
                <Button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 font-black uppercase py-4 ${
                    isLogin
                      ? "bg-red-500 text-black"
                      : "bg-black text-red-500 border-r-2 border-red-500"
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  LOGIN
                </Button>
                <Button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 font-black uppercase py-4 ${
                    !isLogin
                      ? "bg-red-500 text-black"
                      : "bg-black text-red-500 border-l-2 border-red-500"
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  SIGN UP
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-2 text-red-500">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-gray-900 border-4 border-red-500 text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="YOUR@EMAIL.COM"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-2 text-red-500">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-4 pr-12 bg-gray-900 border-4 border-red-500 text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                      placeholder="YOUR PASSWORD"
                      style={{ borderRadius: 0 }}
                    />
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 p-2 bg-red-500 hover:bg-red-600 text-black"
                      style={{ borderRadius: 0 }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-black uppercase tracking-wide mb-2 text-red-500">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-4 bg-gray-900 border-4 border-red-500 text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                      placeholder="CONFIRM PASSWORD"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-widest py-6 text-xl border-4 border-black transform hover:scale-105 transition-all duration-200 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
                >
                  {isLogin ? "LOGIN NOW" : "CREATE ACCOUNT"}
                </Button>
              </form>

              {/* Additional Options */}
              <div className="mt-8 space-y-4">
                {isLogin && (
                  <Button
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white font-bold uppercase underline"
                  >
                    FORGOT PASSWORD?
                  </Button>
                )}

                {/* Free Access Reminder */}
                <div className="bg-red-500 border-4 border-white p-4 text-center">
                  <p className="text-black font-black uppercase text-sm">
                    🎉 100% FREE FOREVER 🎉
                  </p>
                  <p className="text-black font-bold uppercase text-xs mt-1">
                    NO LIMITS • OPEN SOURCE PROJECT
                  </p>
                </div>
              </div>

              {/* Terms */}
              {!isLogin && (
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    BY SIGNING UP YOU AGREE TO OUR
                    <br />
                    <span className="text-red-500 underline cursor-pointer">
                      TERMS & CONDITIONS
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-white text-black p-4 border-4 border-red-500 transform -rotate-1">
              <p className="font-black uppercase text-sm">
                ⚡ OPEN SOURCE & FREE ⚡
              </p>
              <p className="font-bold uppercase text-xs">
                JOIN 847,293 USERS TRACKING FOR FREE
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black border-2 border-red-500 p-2 text-center">
                <p className="text-2xl font-black text-red-500">99.97%</p>
                <p className="text-xs font-bold uppercase">UPTIME</p>
              </div>
              <div className="bg-black border-2 border-red-500 p-2 text-center">
                <p className="text-2xl font-black text-red-500">&lt;50ms</p>
                <p className="text-xs font-bold uppercase">RESPONSE</p>
              </div>
              <div className="bg-black border-2 border-red-500 p-2 text-center">
                <p className="text-2xl font-black text-red-500">BANK</p>
                <p className="text-xs font-bold uppercase">SECURITY</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
