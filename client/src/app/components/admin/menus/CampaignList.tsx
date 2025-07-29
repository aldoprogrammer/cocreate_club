"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
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
  participants?: {
    user: { _id: string; fullName: string; email: string };
    hasPaid: boolean;
    amountPaid: number;
    _id: string;
  }[];
  topParticipantImage?: string;
  allParticipantsImage?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    if (!token) {
      toast.error("Please log in to view campaigns");
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Campaign List</h2>
        <button
          onClick={fetchCampaigns}
          disabled={loading}
          className="flex items-center px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm text-white"
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
      {campaigns.length === 0 ? (
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
  );
}