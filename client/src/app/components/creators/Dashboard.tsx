"use client";

import { useState } from "react";
import Campaign from "@/app/components/creators/menus/Campaign";

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[#1a1a1d] hover:bg-[#222226] transition-all rounded-xl border border-white/10 p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState<string>("Campaigns");

  const tabs = [
    { name: "Campaigns", icon: "🛠️" },
    { name: "Analytics", icon: "📈" },
    { name: "Messages", icon: "📬" },
    { name: "Payouts", icon: "💰" },
    { name: "Profile Customization", icon: "🎨" },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">🎨 Creator Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Manage your content, track your growth, and engage with your supporters.
        </p>

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
        {activeTab === "Campaigns" && <Campaign />}
        {activeTab === "Analytics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="📈 Analytics"
              description="View growth and earnings insights."
            />
          </div>
        )}
        {activeTab === "Messages" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="📬 Messages"
              description="Chat with your audience and backers."
            />
          </div>
        )}
        {activeTab === "Payouts" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="💰 Payouts"
              description="Manage your withdrawal and earning history."
            />
          </div>
        )}
        {activeTab === "Profile Customization" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="🎨 Profile Customization"
              description="Personalize your public creator profile."
            />
          </div>
        )}
      </div>
    </div>
  );
}