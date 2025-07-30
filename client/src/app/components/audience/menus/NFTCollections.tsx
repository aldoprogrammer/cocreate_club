"use client";

import { useState, useEffect } from "react";
import { getContract, sendTransaction } from "thirdweb";
import { claimTo, getNFT } from "thirdweb/extensions/erc1155";
import {
  useActiveWallet,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import { getOwnedTokenIds } from "thirdweb/extensions/erc1155";

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

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const convertIpfsUrl = (ipfsUrl: string) =>
  ipfsUrl?.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${ipfsUrl.replace("ipfs://", "")}`
    : ipfsUrl;

function NFTCard({
  nft,
  isWalletConnected,
  onClaim,
  claiming,
  claimed,
}: {
  nft: NFTReward & { metadata: NFTMetadata | null };
  isWalletConnected: boolean;
  onClaim: (tokenId: bigint) => Promise<void>;
  claiming: boolean;
  claimed: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const tokenId = BigInt(nft.tokenIds[0]);

  // Better image logic: warn, and always show a fallback if error
  const rawImage = nft.metadata?.image || "";
  const usableImage = rawImage ? convertIpfsUrl(rawImage) : "";

  // Debug: Show image URL on each card for manual checks
  useEffect(() => {
    if (usableImage) {
      console.log("Trying to load NFT image:", usableImage);
    }
  }, [usableImage]);

  const fallbackImg = (
    <div className="flex items-center justify-center w-48 h-48 rounded-xl bg-[#1a1a1d] border border-white/10 text-5xl select-none">
      🏆
    </div>
  );

  return (
    <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 shadow-sm hover:bg-[#222226] transition-all duration-200">
      <div className="relative -top-5 mx-auto w-fit bg-gradient-to-r from-indigo-600 to-purple-600 text-white uppercase px-4 py-1 rounded-full text-xs font-semibold tracking-widest shadow-sm select-none">
        Badge NFT
      </div>
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          {/* Loading pulse if image is incoming */}
          {usableImage && !imgLoaded && !imgError && (
            <div className="w-48 h-48 rounded-xl bg-[#222226] animate-pulse" />
          )}
          {/* Show the NFT image if loaded, else fallback */}
          {usableImage && !imgError && (
            <Image
              src={usableImage}
              alt={nft.metadata?.name || "Badge"}
              width={192}
              height={192}
              priority
              unoptimized
              draggable={false}
              className={`w-48 h-48 rounded-xl object-cover border border-white/10 transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => {
                setImgLoaded(true);
                console.log("NFT image loaded:", usableImage);
              }}
              onError={(e) => {
                setImgError(true);
                setImgLoaded(true);
                console.error(
                  "Failed to load NFT image at",
                  usableImage,
                  "event:",
                  e
                );
              }}
            />
          )}
          {/* Fallback: no image or error */}
          {(imgError || !usableImage) && fallbackImg}
        </div>
        {/* Show image URL for manual debugging */}
        <div className="text-xs text-gray-400 break-all max-w-xs pb-2">
          {usableImage && (
            <span className="block break-all opacity-60 font-mono">
              Image: {usableImage}
            </span>
          )}
        </div>
        <div className="text-xl font-semibold tracking-tight text-center text-white">
          {nft.metadata?.name || `Badge Token #${tokenId.toString()}`}
        </div>
        {nft.metadata?.description && (
          <div className="mt-2 text-sm text-gray-400 leading-relaxed text-center max-w-xs line-clamp-3">
            {nft.metadata.description}
          </div>
        )}
        <div className="mt-2 text-sm text-gray-400 font-medium">
          {nft.campaign.title}
        </div>
        <div className="mt-2 text-xs uppercase text-gray-500 tracking-widest font-mono">
          tokenId: {tokenId.toString()}
        </div>
        <div className="mt-6 w-full flex flex-col items-center">
          {!isWalletConnected ? (
            <ConnectButton client={client} chain={etherlinkTestnet} />
          ) : claimed ? (
            <button
              className="w-full bg-gray-500 text-white rounded-full px-6 py-2.5 font-semibold shadow-sm opacity-60 cursor-not-allowed"
              disabled
            >
              Claimed
            </button>
          ) : (
            <button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-6 py-2.5 font-semibold shadow-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onClaim(tokenId)}
              disabled={claiming}
            >
              {claiming ? "Claiming..." : "Claim Reward"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NFTCollections() {
  const [nfts, setNfts] = useState<
    (NFTReward & { metadata: NFTMetadata | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingToken, setClaimingToken] = useState<bigint | null>(null);
  const [ownedTokenIds, setOwnedTokenIds] = useState<bigint[]>([]);
  // Get active wallet/account state from thirdweb
  const activeWallet = useActiveWallet();
  const account = useActiveAccount();

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userData || !token) {
          throw new Error("User not authenticated");
        }

        const user = JSON.parse(userData);
        const response = await axios.get(
          `${BACKEND_URL}/nft-rewards/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Get contract instance
        const contract = getContract({
          address: CONTRACT_ADDRESS,
          chain: etherlinkTestnet,
          client,
        });

        // For each NFT reward, get its onchain metadata
        const nftsWithMetadata = await Promise.all(
          response.data.map(async (nft: NFTReward) => {
            const tokenId = BigInt(nft.tokenIds[0]);
            try {
              const metadata = await getNFT({
                contract,
                tokenId,
              });
              return { ...nft, metadata };
            } catch (error: unknown) {
              console.error(
                `Failed to fetch metadata for token ${tokenId}:`,
                error
              );
              return { ...nft, metadata: null };
            }
          })
        );

        setNfts(nftsWithMetadata);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError("Failed to fetch NFT collections: " + errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  useEffect(() => {
    const fetchOwned = async () => {
      if (!account?.address) {
        setOwnedTokenIds([]);
        return;
      }
      const contract = getContract({
        address: CONTRACT_ADDRESS,
        chain: etherlinkTestnet,
        client,
      });
      const owned = await getOwnedTokenIds({
        contract,
        address: account.address,
        start: 0,
        count: 100, // adjust as needed
      });
      setOwnedTokenIds(
        owned.filter((o) => o.balance > 0n).map((o) => o.tokenId)
      );
    };
    fetchOwned();
  }, [account?.address]);

  // Handler for claiming an NFT
  async function handleClaim(tokenId: bigint) {
    if (!account?.address) {
      toast.error("Connect your wallet first!");
      return;
    }
    setClaimingToken(tokenId);
    try {
      const contract = getContract({
        address: CONTRACT_ADDRESS,
        chain: etherlinkTestnet,
        client,
      });
      const transaction = claimTo({
        contract,
        to: account.address,
        tokenId,
        quantity: 1n,
      });
      await sendTransaction({
        transaction,
        account,
      });
      toast.success("NFT claimed to your wallet!");
    } catch (error: any) {
      toast.error(
        error?.message
          ? `Failed to claim NFT: ${error.message}`
          : "Failed to claim NFT"
      );
    } finally {
      setClaimingToken(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">🎖️ NFT Collections</h1>
          <p className="text-gray-400 text-sm">
            View and claim your NFT rewards from supported campaigns.
          </p>
        </div>

        {loading && (
          <div className="text-center">
            <div className="w-10 h-10 mx-auto border-4 border-t-indigo-600 border-white/10 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 text-sm">Loading your NFTs...</p>
          </div>
        )}
        {error && (
          <p className="text-red-400 bg-[#222226] p-4 rounded-xl border border-white/10 text-center text-sm">
            {error}
          </p>
        )}
        {!loading && !error && nfts.length === 0 && (
          <div className="text-center bg-[#1a1a1d] p-6 rounded-xl border border-white/10">
            <p className="text-gray-400 text-sm">
              No NFTs found for your account. Start participating in campaigns
              to earn rewards!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <NFTCard
              key={nft._id}
              nft={nft}
              isWalletConnected={!!activeWallet}
              onClaim={handleClaim}
              claiming={claimingToken === BigInt(nft.tokenIds[0])}
              claimed={ownedTokenIds.includes(BigInt(nft.tokenIds[0]))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
