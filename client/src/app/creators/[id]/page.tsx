"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import CampaignCard from "@/app/components/creators/menus/campaign/CampaignCard";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

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

export default function CreatorDetail() {
  const { id } = useParams();
  const [creator, setCreator] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCreator();
    fetchCampaigns();
  }, [id]);

  const fetchCreator = async () => {
    if (!token) {
      toast.error("Please log in to view creator details");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreator(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch creator");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${backendUrl}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const creatorCampaigns = response.data.filter(
        (campaign: Campaign) => campaign.creator._id === id
      );
      setCampaigns(creatorCampaigns);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch campaigns");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121214] flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#121214] text-white">
        <Navbar />
        <div className="px-6 py-10">
          <p className="text-sm text-gray-400">Creator not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white">
      <Navbar />
      <div className="px-6 py-10">
        <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">
            {creator.fullName}
          </h2>
          <p className="text-sm text-gray-400">Email: {creator.email}</p>
          <h3 className="text-md font-semibold mt-6 mb-4 text-white">
            Campaigns by {creator.fullName}
          </h3>
          {campaigns.length === 0 ? (
            <p className="text-sm text-gray-400">
              No campaigns created by this creator.
            </p>
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
