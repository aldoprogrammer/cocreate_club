"use client";

import { ConnectButton } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/app/constants/colors";
import { client } from "@/app/client";

export default function CreatorLoginPage() {
  const router = useRouter();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background.dark }}
    >
      <div className="w-full max-w-md">
        <h1 
          className="text-3xl font-bold mb-2 text-center"
          style={{ color: COLORS.text.DEFAULT }}
        >
          Creator Portal
        </h1>
        <p 
          className="text-center mb-8"
          style={{ color: COLORS.text.muted }}
        >
          Connect your wallet to manage your content and earnings
        </p>

        <div className="bg-background-light rounded-xl p-8">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Cocreate Club",
              url: "https://cocreate-club.xyz",
            }}
            connectButton={{
              label: "Connect Wallet",
              style: {
                backgroundColor: COLORS.primary.DEFAULT,
                color: "white",
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
              }
            }}
            connectModal={{
              size: "wide",
              title: "Connect Wallet",
              titleIcon: undefined,
            }}
            onConnect={() => router.push("/creator")}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: COLORS.background.light }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-2"
                style={{ 
                  backgroundColor: COLORS.background.DEFAULT,
                  color: COLORS.text.muted
                }}
              >
                OR
              </span>
            </div>
          </div>

          <button
            className="w-full py-3 rounded-lg font-medium border"
            style={{
              backgroundColor: "transparent",
              color: COLORS.text.DEFAULT,
              borderColor: COLORS.primary.DEFAULT,
            }}
          >
            Apply to Become a Creator
          </button>
        </div>
      </div>
    </div>
  );
}