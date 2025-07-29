"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface NFTReward {
  _id: string;
  user: { _id: string; fullName: string; email: string };
  campaign: { _id: string; title: string };
  tokenIds: string[];
  creator: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function NFTCard({ nft }: { nft: NFTReward }) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/nft-rewards/${nft._id}/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert("NFT claimed successfully!");
    } catch (error) {
      console.error("Error claiming NFT:", error);
      alert("Failed to claim NFT");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-[#1a1a1d] hover:bg-[#222226] transition-all rounded-xl border border-white/10 p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-1">NFT: {nft.campaign.title}</h2>
      <p className="text-sm text-gray-400 mb-2">
        Token IDs: {nft.tokenIds.join(", ")}
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Created: {new Date(nft.createdAt).toLocaleDateString()}
      </p>
      <button
        onClick={handleClaim}
        disabled={isClaiming}
        className={`px-4 py-2 rounded-full text-sm ${
          isClaiming
            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isClaiming ? "Claiming..." : "Claim NFT"}
      </button>
    </div>
  );
}

export default function NFTCollections() {
  const [nfts, setNfts] = useState<NFTReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          throw new Error('User not authenticated');
        }

        const user = JSON.parse(userData);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/nft-rewards/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setNfts(response.data);
      } catch (err) {
        setError("Failed to fetch NFT collections. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">🎖️ NFT Collections</h1>
        <p className="text-gray-400 mb-8">
          View and claim your NFT rewards from supported campaigns.
        </p>

        {loading && <p className="text-gray-400">Loading NFTs...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && nfts.length === 0 && (
          <p className="text-gray-400">No NFTs found for your account.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <NFTCard key={nft._id} nft={nft} />
          ))}
        </div>
      </div>
    </div>
  );
}