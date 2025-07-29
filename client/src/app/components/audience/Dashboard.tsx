"use client";

import { useState } from "react";
import NFTCollections from "./menus/NFTCollections";

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[#1a1a1d] hover:bg-[#222226] transition-all rounded-xl border border-white/10 p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

export default function AudienceDashboard() {
  const [activeTab, setActiveTab] = useState<string>("Overview");

  const tabs = [
    { name: "Overview", icon: "📊" },
    { name: "NFT Collections", icon: "🎖️" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">👤 Audience Dashboard</h1>
        <p className="text-gray-400 mb-8">Explore your creators, contributions, and rewards.</p>

        {/* Tabs Navigation */}
        <div className="flex border-b border-white/10 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.name
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="❤️ Followed Creators" description="See updates from creators you support." />
            <Card title="🎁 Rewards & Perks" description="Unlock exclusive content and benefits." />
            <Card title="🧾 Contributions" description="Track your past donations and tips." />
            <Card title="🔒 Wallet & Access" description="Connect or manage your Web3 wallet." />
            <Card title="⚙️ Settings" description="Change preferences, profile, and security." />
          </div>
        )}
        {activeTab === "NFT Collections" && <NFTCollections />}
      </div>
    </div>
  );
}