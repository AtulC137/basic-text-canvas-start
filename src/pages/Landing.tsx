
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import AboutDeveloper from "@/components/AboutDeveloper";
import WhatWeCanDo from "@/components/WhatWeCanDo";
import React from "react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading, authInitialized } = useAuth();
  const { toast } = useToast();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Show loading if auth status is still initializing
  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  };

  // Main layout: two vertical sections
  return (
    <>
      <LandingHeader />
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Left Section - Logo and App Name - Increase logo size */}
        <div className="md:w-1/2 flex flex-col items-center justify-center bg-black md:bg-transparent py-16 px-8 pt-24 md:pt-16">
          <div className="w-full flex flex-col items-center">
            <Logo animated className="w-56 h-56 mx-auto mb-10 md:mb-8 drop-shadow-lg shadow-google-blue transition-all duration-300" />
            <h2 className="text-4xl font-extrabold text-white md:text-gray-900 drop-shadow md:drop-shadow-none tracking-tight mb-2">
              SaveBits
            </h2>
            <p className="hidden md:block text-google-blue text-lg mt-2 mb-2 font-semibold uppercase tracking-wide">
              Google Drive Storage Optimizer
            </p>
          </div>
        </div>

        {/* Right Section - Memo line and CTA */}
        <div className="md:w-1/2 flex flex-col justify-center items-center px-8 py-20 pt-10 md:pt-20">
          <div className="w-full max-w-xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Free up your Google
              <span className="text-google-blue"> Storage</span>
              <br />
              <span className="text-google-green">Instantly.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              SaveBits compresses and manages your Drive files with one click — no downloads needed.
            </p>
            
            {/* Privacy Policy Link - Prominent placement for Google verification */}
            <div className="mb-8 p-4 bg-white/50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                By using SaveBits, you agree to our data handling practices.
              </p>
              <Link 
                to="/privacy" 
                className="text-google-blue hover:text-blue-600 font-medium underline underline-offset-2"
              >
                Read our Privacy Policy
              </Link>
            </div>

            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-google-blue hover:bg-blue-600 text-white px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </Button>
          </div>
        </div>
      </div>
      <WhatWeCanDo />
      <AboutDeveloper />
      <Footer />
    </>
  );
};

export default Landing;
