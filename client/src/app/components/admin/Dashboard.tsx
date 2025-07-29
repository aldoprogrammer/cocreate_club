"use client";

import React, { useState } from "react";
import CampaignList from "./menus/CampaignList";
import DeployNFTasBadge from "./menus/DeployNFTasBadge";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<"campaigns" | "deploy-nft">("campaigns");

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">🛡️ Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Manage campaigns, deploy NFTs, and configure system settings.
        </p>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveSection("campaigns")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeSection === "campaigns"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Campaign List
          </button>
          <button
            onClick={() => setActiveSection("deploy-nft")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeSection === "deploy-nft"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Deploy NFT
          </button>
        </div>

        {/* Content */}
        {activeSection === "campaigns" && <CampaignList />}
        {activeSection === "deploy-nft" && <DeployNFTasBadge />}
      </div>
    </div>
  );
}