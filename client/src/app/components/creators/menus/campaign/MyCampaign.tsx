"use client";

import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  options: { label: string; count: number; _id: string }[];
  creator: { _id: string; fullName: string };
  participants?: { user: string; hasPaid: boolean; _id: string }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MyCampaignProps {
  campaigns: Campaign[];
  loading: boolean;
  fetchCampaigns: () => Promise<void>;
  openEditModal: (campaign: Campaign) => void;
  handleDelete: (id: string) => Promise<void>;
  backendUrl: string | undefined;
  user: { _id: string; email: string; fullName: string; role: string } | null;
  token: string | null;
  linkToDetail?: boolean;
}

export default function MyCampaign({
  campaigns,
  loading,
  fetchCampaigns,
  openEditModal,
  handleDelete,
  backendUrl,
  user,
  token,
  linkToDetail = false,
}: MyCampaignProps) {
  // Validate MongoDB ObjectID
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  return (
    <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">My Campaigns</h2>
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
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-gray-400">No campaigns available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            if (!isValidObjectId(campaign._id)) {
              console.warn(`Skipping campaign with invalid ID: ${campaign._id}`);
              toast.error(`Invalid campaign ID: ${campaign._id}`);
              return null;
            }

            const content = (
              <div className="bg-[#222226] hover:bg-[#2a2a2e] transition-all rounded-xl border border-white/10 p-5 shadow-sm cursor-pointer">
                {campaign.images.length > 0 ? (
                  <img
                    src={`${backendUrl}${campaign.images[0]}`}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center rounded-md mb-2 bg-[#1a1a1d]">
                    <p className="text-sm text-gray-400">No image available</p>
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1 text-white">{campaign.title}</h3>
                <p className="text-sm text-gray-400">{campaign.description}</p>
                <p className="text-sm text-gray-400 mt-2">Price: {campaign.price}</p>
                <p className="text-sm text-gray-400">Category: {campaign.category || "N/A"}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(campaign)}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign._id)}
                    className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );

            return linkToDetail ? (
              <Link key={campaign._id} href={`/campaigns/${campaign._id}`} className="block">
                {content}
              </Link>
            ) : (
              <div key={campaign._id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}