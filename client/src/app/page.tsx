"use client";

import { useRouter } from "next/navigation";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import Header from "./components/Header";
import { COLORS } from "./constants/colors";
import ThirdwebResources from "./components/ThirdwebResources";

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: COLORS.background.dark }}
    >
      <div className="py-20 px-4 w-full max-w-screen-lg mx-auto">
        <Header />

        <div className="flex justify-center mb-20">
          <button
            onClick={() => router.push("/auth/login")}
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
      </div>
    </main>
  );
}