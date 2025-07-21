"use client";

import { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import { COLORS } from "./constants/colors";
import ThirdwebResources from "./components/ThirdwebResources";
export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: COLORS.background.dark }}
    >
      <div className="py-20 px-4 w-full max-w-screen-lg mx-auto">
        <Header />

        <div className="flex justify-center mb-20">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-8 py-3 rounded-full font-medium text-lg"
            style={{
              backgroundColor: COLORS.primary.DEFAULT,
              color: "white",
            }}
          >
            Join Cocreate Club
          </button>
        </div>

        <ThirdwebResources />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </main>
  );
}