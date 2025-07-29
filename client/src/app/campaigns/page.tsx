"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import CampaignCard from "@/app/components/creators/menus/campaign/CampaignCard";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  status: string;
  options: { label: string; count: number; _id: string }[];
  creator: { _id: string; fullName: string };
  participants?: { user: { _id: string; fullName: string; email: string }; hasPaid: boolean; amountPaid: number; _id: string }[];
  topParticipantImage?: string;
  allParticipantsImage?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function CampaignPublic() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    if (!token) {
      toast.error("Please log in to view campaigns");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white">
      <Navbar />
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="bg-[#1a1a1d] rounded-3xl border border-white/10 p-8 shadow-lg shadow-indigo-500/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">All Campaigns</h2>
            <button
              onClick={fetchCampaigns}
              disabled={loading}
              className="flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold text-white transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-gray-400">No campaigns available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  backendUrl={backendUrl}
                  linkToDetail={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}