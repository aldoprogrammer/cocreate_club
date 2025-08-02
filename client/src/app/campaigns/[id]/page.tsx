"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CircleDollarSign, Info, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  TransactionButton,
  useActiveAccount,
  ConnectButton,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import { toWei, prepareTransaction } from "thirdweb";

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AggregatedParticipant {
  user: { _id: string; fullName: string; email: string };
  totalAmountPaid: number;
  voteCount: number;
  addressReward: string;
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
  participants: AggregatedParticipant[];
  topParticipantImage?: string;
  allParticipantsImage?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UserSession {
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user: UserSession | null =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (campaign?.price) {
      setAmountPaid(campaign.price.toFixed(3));
    }
  }, [campaign]);

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

      // Aggregate participants by user
      const aggregatedParticipants = Object.values(
        response.data.participants.reduce(
          (acc: { [key: string]: AggregatedParticipant }, p: any) => {
            const userId = p.user._id;
            if (!acc[userId]) {
              acc[userId] = {
                user: p.user,
                totalAmountPaid: 0,
                voteCount: 0,
                addressReward: p.addressReward,
              };
            }
            acc[userId].totalAmountPaid += p.amountPaid;
            acc[userId].voteCount += 1;
            return acc;
          },
          {}
        )
      ).sort((a: any, b: any) => b.totalAmountPaid - a.totalAmountPaid);

      const sortedCampaign: Campaign = {
        ...response.data,
        participants: aggregatedParticipants,
      };
      setCampaign(sortedCampaign);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!token || !user || user._id !== campaign?.creator._id) {
      toast.error("Only the creator can toggle campaign status");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.patch(
        `${backendUrl}/campaigns/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Status updated successfully!");
      fetchCampaign();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  const campaignTreasury = process.env.NEXT_PUBLIC_CAMPAIGN_RECEIVER!;
  const account = useActiveAccount();

  // Calculate the number of votes for the current user
  const userVoteCount =
    campaign?.participants?.reduce(
      (count: number, p: AggregatedParticipant) =>
        p.user._id === user?._id ? count + p.voteCount : count,
      0
    ) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0f0f12] text-white">
        <Navbar />
        <div className="px-6 py-10">
          <p className="text-sm text-gray-400">Campaign not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white">
      <Navbar />
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-6 mb-6 shadow-lg shadow-red-500/20">
          <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-300" />
            Be the Top Spender to Win an Exclusive NFT!
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            You have <span className="font-semibold text-indigo-300">5 chances</span> to outbid others and claim the top prize!
          </p>
        </div>
        <div className="bg-[#1a1a1d] rounded-3xl border border-white/10 p-10 shadow-2xl shadow-indigo-500/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {campaign.title}
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-semibold px-4 py-2 rounded-full ${
                  campaign.status === "active"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                Status:{" "}
                {campaign.status.charAt(0).toUpperCase() +
                  campaign.status.slice(1)}
              </span>
              {user?._id === campaign.creator._id && (
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className="flex justify-center items-center rounded-full font-semibold text-sm px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    `Set to ${
                      campaign.status === "active" ? "Finished" : "Active"
                    }`
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="grid w-full grid-cols-2">
            <div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Campaign Images
                </h3>
                {campaign.images.length > 0 ? (
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-indigo-500/50 scrollbar-track-[#1a1a1d]">
                    {campaign.images.map((url, index) => (
                      <div key={index} className="flex-shrink-0">
                        <img
                          src={`${backendUrl}${url}`}
                          alt={`${campaign.title} ${index + 1}`}
                          className="w-64 h-64 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No campaign images available
                  </p>
                )}
              </div>
              <p className="text-base text-gray-200 mb-6 leading-relaxed font-light">
                {campaign.description}
              </p>
              <div className="grid grid-cols-1 gap-1 mb-8">
                <p className="text-sm text-gray-400">
                  Category:{" "}
                  <span className="font-semibold text-gray-100">
                    {campaign.category || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  Minimum Price to Participate:{" "}
                  <span className="font-semibold text-gray-100">
                    {campaign.price.toFixed(3)}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  Creator:{" "}
                  <Link
                    href={`/creators/${campaign.creator._id}`}
                    className="underline hover:text-indigo-400 transition-colors duration-200"
                  >
                    {campaign.creator.fullName}
                  </Link>
                </p>
              </div>
            </div>
            <div className="mt-8 mb-8 p-6 bg-gradient-to-br h-[240px] from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/30">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                  <Info className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                    <Trophy className="h-5 w-5 text-amber-300" />
                    Voting Mechanism
                  </h3>
                  <p className="text-gray-200">
                    The winner is determined by{" "}
                    <span className="font-medium text-indigo-300">
                      total funds contributed
                    </span>
                    , not vote count. Higher contributions give your option more
                    weight.
                  </p>
                  <div className="mt-3 flex items-start gap-2 text-sm bg-indigo-900/30 px-3 py-2 rounded-lg">
                    <CircleDollarSign className="h-4 w-4 mt-0.5 text-indigo-300" />
                    <span className="text-gray-300">
                      Become the top contributor to win an{" "}
                      <span className="font-medium text-indigo-300">
                        exclusive NFT
                      </span>{" "}
                      from the creator! You have{" "}
                      <span className="font-medium text-indigo-300">
                        up to 5 chances
                      </span>{" "}
                      to make your mark—choose your amount wisely!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Participant (Reward) NFT Images
            </h3>
            {campaign.topParticipantImage || campaign.allParticipantsImage ? (
              <div className="flex gap-4 pb-4">
                {campaign.topParticipantImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={`${backendUrl}${campaign.topParticipantImage}`}
                      alt="Top Participant"
                      className={`w-64 h-64 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
                        user?.role === "admin" ? "" : "filter blur-[5px]"
                      }`}
                    />
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Top Paid Participant (The Special One)
                    </p>
                  </div>
                )}
                {campaign.allParticipantsImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={`${backendUrl}${campaign.allParticipantsImage}`}
                      alt="All Participants"
                      className="w-64 h-64 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                    />
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      All Participants
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                No participant images available
              </p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Vote Options
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.options.map((option, index) => (
                <li
                  key={option._id}
                  className="text-sm text-gray-200 bg-[#222226] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {option.label}{" "}
                  <span className="text-gray-400 font-medium">
                    (Votes: {option.count})
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {campaign.participants && campaign.participants.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-white">
                Leaderboard: Top Spending Participants
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {campaign.participants.map(
                  (participant: AggregatedParticipant, index: number) => (
                    <li
                      key={participant.user._id}
                      className="text-sm text-gray-200 bg-[#222226] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between items-center"
                    >
                      <span>
                        <span className="font-semibold">
                          {index + 1}. {participant.user.fullName}
                        </span>{" "}
                        <span className="text-gray-400">
                          (
                          {participant.totalAmountPaid > 0 ? (
                            campaign.status === "active" ? (
                              <span className="filter blur-[3px]">
                                {participant.totalAmountPaid.toFixed(3)}
                              </span>
                            ) : (
                              `Paid ${participant.totalAmountPaid.toFixed(3)}`
                            )
                          ) : (
                            "Not Paid"
                          )}
                          {user?._id === participant.user._id && (
                            <span className="ml-2 text-indigo-300">
                              (Votes: {participant.voteCount}/5)
                            </span>
                          )}
                          )
                        </span>
                      </span>
                      {campaign.status === "finished" &&
                        user?._id === participant.user._id && (
                          <Link
                            href={`/campaigns/${campaign._id}/claim-nft`}
                            className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Claim NFT
                          </Link>
                        )}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          {campaign.status === "active" && (
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4 text-white">
                Cast Your Vote ({userVoteCount}/5)
              </h3>
              <ConnectButton client={client} chain={etherlinkTestnet} />

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Select Option
                  </label>
                  <select
                    value={voteIndex}
                    onChange={(e) => setVoteIndex(parseInt(e.target.value))}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-200"
                    disabled={userVoteCount >= 5}
                  >
                    {campaign.options.map((option, index) => (
                      <option key={option._id} value={index}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Amount Paid (minimum {campaign.price.toFixed(3)})
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-200"
                    placeholder={`${campaign.price.toFixed(3)}`}
                    step="0.001"
                    min={campaign.price}
                    required
                    disabled={userVoteCount >= 5}
                  />
                </div>
                <TransactionButton
                  transaction={async () => {
                    if (!account || !account.address) {
                      throw new Error("Please connect your wallet.");
                    }
                    if (!amountPaid || Number(amountPaid) < campaign.price) {
                      throw new Error("Enter a valid amount.");
                    }
                    if (userVoteCount >= 5) {
                      throw new Error("Maximum 5 votes reached.");
                    }

                    return prepareTransaction({
                      to: campaignTreasury,
                      value: toWei(amountPaid),
                      chain: etherlinkTestnet,
                      client,
                    });
                  }}
                  onTransactionConfirmed={async (tx) => {
                    try {
                      if (!account || !account.address) {
                        throw new Error("Wallet not connected.");
                      }
                      await axios.post(
                        `${backendUrl}/campaigns/${id}/vote`,
                        {
                          voteIndex: Number(voteIndex),
                          amountPaid: parseFloat(amountPaid),
                          txHash: tx.transactionHash,
                          addressReward: account.address,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success("Vote and payment recorded!");
                      setAmountPaid("");
                      fetchCampaign();
                    } catch (error: any) {
                      toast.error(
                        error?.response?.data?.error || "Failed to record vote"
                      );
                    }
                  }}
                  disabled={userVoteCount >= 5}
                >
                  Pay & Vote
                </TransactionButton>
                {userVoteCount >= 5 && (
                  <p className="text-sm text-red-400">
                    You have reached the maximum of 5 votes for this campaign.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}