"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getContract } from "thirdweb";
import { getNFT } from "thirdweb/extensions/erc1155";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const TOKEN_ID = 4n;

const convertIpfsUrl = (ipfsUrl: string) => {
  if (ipfsUrl?.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${ipfsUrl.replace('ipfs://', '')}`;
  }
  return ipfsUrl;
};

export default function BadgePage() {
  const [nft, setNft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let done = false;
    (async () => {
      setLoading(true);
      try {
        const contract = await getContract({
          address: CONTRACT_ADDRESS,
          chain: etherlinkTestnet,
          client,
        });
        const badge = await getNFT({
          contract,
          tokenId: TOKEN_ID,
        });
        if (!done) setNft(badge);
      } catch (e: any) {
        if (!done) setErr("Failed to load badge: " + (e.message || e));
      } finally {
        if (!done) setLoading(false);
      }
    })();
    return () => { done = true; };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-gray-50 to-white">
      <div className="animate-pulse w-96 h-80 rounded-2xl bg-gray-200 shadow-lg" />
    </div>
  );

  if (err) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600 bg-red-50 px-6 py-4 rounded shadow">{err}</div>
    </div>
  );

  if (!nft) return (
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
        <div className="flex flex-col items-center mt-7">
          <div className="relative mb-5">
            {/* Show loading skeleton while image is loading */}
            {!imgLoaded && !imgError && (
              <div className="w-32 h-32 rounded-xl bg-gray-200 animate-pulse" />
            )}

            {/* Show the actual image if loaded and no error */}
            {!imgError && (
              <Image
                src={convertIpfsUrl(nft.metadata.image)}
                alt={nft.metadata?.name || "Badge"}
                width={128}
                height={128}
                className={`w-32 h-32 rounded-xl object-cover border border-gray-200 transition-shadow shadow-md bg-white ${imgLoaded ? "" : "hidden"}`}
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

            {/* Show fallback only if image failed to load */}
            {imgError && fallbackImg}
          </div>

          <div className="mt-3 text-xl md:text-2xl font-bold tracking-tight text-center text-gray-900">
            {nft.metadata?.name || `Badge Token #${TOKEN_ID}`}
          </div>
          {nft.metadata?.description && (
            <div className="mt-2 text-base text-gray-600 leading-relaxed text-center max-w-xs">
                            Description: {nft.metadata.description || "No description available."}

            </div>
          )}
          <div className="mt-4 text-xs uppercase text-gray-400 tracking-widest font-mono">
            tokenId: {TOKEN_ID.toString()}
          </div>
        </div>
      </div>
    </div>
  );
}