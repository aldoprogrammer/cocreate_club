"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  options: { label: string; count: number; _id: string }[];
  creator: { _id: string; fullName: string };
  participants?: { user: { _id: string; fullName: string; email: string }; hasPaid: boolean; _id: string }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [voteIndex, setVoteIndex] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = localStorage.getItem("token");
  const user: User | null = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    if (!token) {
      toast.error("Please log in to view campaign details");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaign(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !user) {
      toast.error("Please log in to vote");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/campaigns/${id}/vote`,
        { voteIndex: Number(voteIndex), amountPaid: parseFloat(amountPaid) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Vote recorded successfully!");
      setAmountPaid("");
      fetchCampaign();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to record vote");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121214] flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#121214] text-white">
        <Navbar />
        <div className="px-6 py-2">
          <p className="text-sm text-gray-400">Campaign not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white">
      <Navbar />
      <div className="px-6 py-10">
        <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">{campaign.title}</h2>
          <p className="text-sm text-gray-400 mb-2">{campaign.description}</p>
          <p className="text-sm text-gray-400">Category: {campaign.category || "N/A"}</p>
          <p className="text-sm text-gray-400">Price: {campaign.price}</p>
          <p className="text-sm text-gray-400">
            Creator:{" "}
            <Link href={`/creators/${campaign.creator._id}`} className="underline hover:text-gray-300">
              {campaign.creator.fullName}
            </Link>
          </p>
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2 text-white">Images</h3>
            {campaign.images.length > 0 ? (
              <div className="flex gap-4 flex-wrap">
                {campaign.images.map((url, index) => (
                  <img
                    key={index}
                    src={`${backendUrl}${url}`}
                    alt={`${campaign.title} ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No image</p>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2 text-white">Vote Options</h3>
            <ul className="list-disc list-inside text-sm text-gray-400">
              {campaign.options.map((option, index) => (
                <li key={option._id}>
                  {option.label} (Votes: {option.count})
                </li>
              ))}
            </ul>
          </div>
          {campaign.participants && campaign.participants.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2 text-white">Participants</h3>
              <ul className="list-disc list-inside text-sm text-gray-400">
                {campaign.participants.map((participant) => (
                  <li key={participant._id}>
                    {participant.user.fullName} ({participant.hasPaid ? "Paid" : "Not Paid"})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-white">Cast Your Vote</h3>
            <form onSubmit={handleVote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Select Option</label>
                <select
                  value={voteIndex}
                  onChange={(e) => setVoteIndex(parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                >
                  {campaign.options.map((option, index) => (
                    <option key={option._id} value={index}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Amount Paid (minimum {campaign.price})
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  placeholder={`${campaign.price}`}
                  step="0.001"
                  min={campaign.price}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center w-full rounded-full font-medium text-sm px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Voting...
                  </>
                ) : (
                  "Submit Vote"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}