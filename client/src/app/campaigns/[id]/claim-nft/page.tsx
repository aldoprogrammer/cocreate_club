"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ConnectButton, ClaimButton, useActiveWallet } from "thirdweb/react";
import { getContract } from "thirdweb";
import { getNFT } from "thirdweb/extensions/erc1155";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const convertIpfsUrl = (ipfsUrl: string) =>
  ipfsUrl?.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${ipfsUrl.replace("ipfs://", "")}`
    : ipfsUrl;

export default function BadgePage() {
  const [nft, setNft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const wallet = useActiveWallet();
  const { id: campaignId } = useParams();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  useEffect(() => {
    let done = false;
    (async () => {
      if (!token || !user || !campaignId) {
        if (!done) {
          setErr("Please log in and provide a valid campaign ID");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // Fetch campaign data
        const response = await axios.get(`${BACKEND_URL}/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const campaign = response.data;

        // Find participant's token ID
        const participant = campaign.participants.find((p: any) => p.user._id === user._id);
        if (!participant) {
          throw new Error("You are not a participant in this campaign");
        }
        if (!participant.tokenId) {
          throw new Error("No token ID assigned to you for this campaign");
        }

        const tokenIdBigInt = BigInt(participant.tokenId);
        setTokenId(tokenIdBigInt);

        // Fetch NFT metadata
        const contract = await getContract({
          address: CONTRACT_ADDRESS,
          chain: etherlinkTestnet,
          client,
        });
        const badge = await getNFT({
          contract,
          tokenId: tokenIdBigInt,
        });
        if (!done) setNft(badge);
      } catch (e: any) {
        if (!done) setErr("Failed to load badge: " + (e.message || e));
      } finally {
        if (!done) setLoading(false);
      }
    })();
    return () => {
      done = true;
    };
  }, [campaignId, user?._id, token]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-gray-50 to-white">
        <div className="animate-pulse w-96 h-80 rounded-2xl bg-gray-200 shadow-lg" />
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 bg-red-50 px-6 py-4 rounded shadow">
          {err}
        </div>
      </div>
    );

  if (!nft || !tokenId)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Badge not found.
      </div>
    );

  const fallbackImg = (
    <div className="flex items-center justify-center w-32 h-32 rounded-xl bg-gray-100 border border-gray-200 text-4xl select-none">
      🏆
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md mx-auto rounded-2xl shadow-2xl bg-white p-8 relative">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white uppercase px-3 py-1 rounded-full text-xs font-semibold tracking-widest shadow-sm select-none">
          Badge NFT
        </div>
        <div className="flex justify-center mb-4">
          <ConnectButton client={client} chain={etherlinkTestnet} />
        </div>
        <div className="flex flex-col items-center mt-3">
          <div className="relative mb-5">
            {!imgLoaded && !imgError && (
              <div className="w-32 h-32 rounded-xl bg-gray-200 animate-pulse" />
            )}
            {!imgError && (
              <Image
                src={convertIpfsUrl(nft.metadata.image)}
                alt={nft.metadata.name || "Badge"}
                width={128}
                height={128}
                className={`w-32 h-32 rounded-xl object-cover border border-gray-200 transition-shadow shadow-md bg-white ${
                  imgLoaded ? "" : "hidden"
                }`}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgError(true);
                  setImgLoaded(true);
                }}
                draggable={false}
                unoptimized
                priority
              />
            )}
            {imgError && fallbackImg}
          </div>

          <div className="mt-3 text-xl md:text-2xl font-bold tracking-tight text-center text-gray-900">
            {nft.metadata.name || `Badge Token #${tokenId.toString()}`}
          </div>
          {nft.metadata.description && (
            <div className="mt-2 text-base text-gray-600 leading-relaxed text-center max-w-xs">
              Description: {nft.metadata.description}
            </div>
          )}
          <div className="mt-4 text-xs uppercase text-gray-400 tracking-widest font-mono">
            tokenId: {tokenId.toString()}
          </div>

          <div className="mt-6">
            {!wallet ? (
              <div className="text-sm text-gray-500">
                Please connect your wallet to claim the badge.
              </div>
            ) : (
              <ClaimButton
                contractAddress={CONTRACT_ADDRESS}
                client={client}
                chain={etherlinkTestnet}
                claimParams={{
                  type: "ERC1155",
                  tokenId,
                  quantity: 1n,
                }}
              >
                Klaim Badge
              </ClaimButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}