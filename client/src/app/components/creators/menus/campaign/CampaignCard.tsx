"use client";

import Link from "next/link";

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

interface CampaignCardProps {
  campaign: Campaign;
  backendUrl: string | undefined;
  linkToDetail?: boolean;
}

export default function CampaignCard({ campaign, backendUrl, linkToDetail = false }: CampaignCardProps) {
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