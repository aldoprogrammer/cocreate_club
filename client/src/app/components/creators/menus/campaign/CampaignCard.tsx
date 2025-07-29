"use client";

import Link from "next/link";

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

interface CampaignCardProps {
  campaign: Campaign;
  backendUrl: string | undefined;
  linkToDetail?: boolean;
}

export default function CampaignCard({ campaign, backendUrl, linkToDetail = false }: CampaignCardProps) {
  const content = (
    <div className="bg-[#222226] rounded-xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#2a2a2e] cursor-pointer">
      <div className="relative">
        {campaign.images.length > 0 ? (
          <img
            src={`${backendUrl}${campaign.images[0]}`}
            alt={campaign.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center rounded-lg mb-4 bg-[#1a1a1d]">
            <p className="text-sm text-gray-400">No image available</p>
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-xs font-semibold px-3 py-1 rounded-full ${
            campaign.status === "active"
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white truncate">{campaign.title}</h3>
      <p className="text-sm text-gray-300 mb-3 line-clamp-3">{campaign.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Minimum Price to Participate: <span className="font-medium text-gray-100">{campaign.price.toFixed(3)}</span> (XTZ)</span>
        <span>Category: <span className="font-medium text-gray-100">{campaign.category || "N/A"}</span></span>
      </div>
    </div>
  );

  return linkToDetail ? (
    <Link href={`/campaigns/${campaign._id}`} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}