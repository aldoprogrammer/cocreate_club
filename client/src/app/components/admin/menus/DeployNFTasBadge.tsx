"use client";
import React, { useState, useEffect } from "react";
import {
  lazyMint,
  nextTokenIdToMint,
  setClaimConditions,
} from "thirdweb/extensions/erc1155";
import { getContract, sendTransaction } from "thirdweb";
import {
  TransactionButton,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import toast from "react-hot-toast";

// Define interfaces for TypeScript
interface Campaign {
  _id: string;
  title: string;
  status: string;
}

interface Participant {
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  amountPaid: number;
}

interface Metadata {
  name: string;
  description: string;
  image: File | undefined;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const EXPLORER_PREFIX = process.env.NEXT_PUBLIC_EXPLORER_PREFIX!;
const NATIVE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export default function DeployNFTasBadge() {
  const account = useActiveAccount();
  const [metadata, setMetadata] = useState<Metadata>({
    name: "",
    description: "",
    image: undefined,
  });
  const [price, setPrice] = useState<string>("0.001");
  const [maxSupply, setMaxSupply] = useState<string>("1");
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [isSubmittingReward, setIsSubmittingReward] = useState<boolean>(false);

  // Helper: parse price string to number (in ether)
  function parsePriceToNumber(priceStr: string): number | null {
    const priceNum = Number(priceStr);
    if (!priceStr || isNaN(priceNum) || priceNum < 0) return null;
    return priceNum;
  }

  // Fetch finished campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch(`${BACKEND_URL}/campaigns`);
        const data: Campaign[] = await response.json();
        const finishedCampaigns = data.filter(
          (campaign) => campaign.status === "finished"
        );
        setCampaigns(finishedCampaigns);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    }
    fetchCampaigns();
  }, []);

  // Fetch participants and update metadata when a campaign or participant is selected
  useEffect(() => {
    async function fetchParticipants() {
      if (selectedCampaign) {
        try {
          const response = await fetch(
            `${BACKEND_URL}/campaigns/${selectedCampaign}`
          );
          const campaign: { participants: Participant[] } =
            await response.json();
          // Sort participants by amountPaid in descending order
          const sortedParticipants = (campaign.participants || []).sort(
            (a, b) => b.amountPaid - a.amountPaid
          );
          setParticipants(sortedParticipants);

          // Find selected campaign to get its title
          const selectedCampaignData = campaigns.find(
            (c) => c._id === selectedCampaign
          );
          if (selectedCampaignData) {
            const name = `Top Spender On ${selectedCampaignData.title}`;
            // Initialize description with participant name if selected
            const selectedParticipantData = selectedParticipant
              ? sortedParticipants.find((p) => p.user._id === selectedParticipant)
              : null;
            const description = selectedParticipantData
              ? `The Best Reward for ${selectedParticipantData.user.fullName} as the Top Spender in the ${selectedCampaignData.title}`
              : `NFT badge for top spender in the ${selectedCampaignData.title} campaign`;

            setMetadata({
              ...metadata,
              name,
              description,
            });
          }
        } catch (error) {
          console.error("Failed to fetch participants:", error);
        }
      } else {
        setParticipants([]);
        setMetadata({ ...metadata, name: "", description: "" });
      }
    }
    fetchParticipants();
  }, [selectedCampaign, selectedParticipant, campaigns]);

  // Create NFT reward
  async function createNFTReward() {
    if (!account || !selectedCampaign || !selectedParticipant || !tokenId) {
      throw new Error("Missing required fields for NFT reward");
    }

    setIsSubmittingReward(true);
    try {
      const response = await fetch(`${BACKEND_URL}/nft-rewards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: selectedParticipant,
          campaignId: selectedCampaign,
          tokenIds: [tokenId.toString()],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create NFT reward");
      }

      const data = await response.json();

      toast.success("NFT reward successfully sent!");

      return data;
    } catch (err) {
      toast.error("Failed to submit NFT reward.");
      console.error(err);
    } finally {
      setIsSubmittingReward(false);
    }
  }

  let claimInfo = "";
  if (maxSupply && Number(maxSupply) > 0) {
    claimInfo = `Only ${maxSupply} people can claim this Top Spender NFT Badge.`;
  } else {
    claimInfo = "Isi jumlah maksimal supporter";
  }

  return (
    <div className="p-4 space-y-4 bg-white text-black rounded-xl shadow-lg max-w-md">
      <ConnectButton client={client} chain={etherlinkTestnet} />
      {account ? (
        <div className="text-green-900 bg-green-100 rounded p-2 my-2 font-mono text-xs">
          Connected: {account.address}
        </div>
      ) : (
        <div className="text-gray-900 bg-gray-100 rounded p-2 my-2">
          Not connected
        </div>
      )}

      <div>
        <label htmlFor="campaignSelect" className="block text-sm font-medium">
          Select Finished Campaign
        </label>
        <select
          id="campaignSelect"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCampaign && (
        <div>
          <label
            htmlFor="participantSelect"
            className="block text-sm font-medium"
          >
            Select Participant
          </label>
          <select
            id="participantSelect"
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a participant</option>
            {participants.map((participant) => (
              <option key={participant.user._id} value={participant.user._id}>
                {participant.user.fullName} ({participant.user.email}) - {participant.amountPaid} XTZ
              </option>
            ))}
          </select>
        </div>
      )}

      <h2 className="text-xl font-bold">Create Top Spender NFT Badge</h2>
      <input
        type="text"
        placeholder="Name"
        value={metadata.name}
        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="Description"
        value={metadata.description}
        onChange={(e) =>
          setMetadata({
            ...metadata,
            description: e.target.value,
          })
        }
        className="w-full p-2 border rounded"
      />
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setMetadata({
              ...metadata,
              image: e.target.files[0],
            });
          }
        }}
        className="w-full"
      />
      <div>
        <label htmlFor="price">Price for claim (XTZ)</label>
        <input
          type="number"
          min="0"
          step="0.0001"
          placeholder="Price for claim 0.001 (XTZ)"
          value={price}
          disabled
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>
      <div className="text-xs text-gray-600 mb-2">{claimInfo}</div>

      <TransactionButton
        transaction={async () => {
          if (!account) throw new Error("Connect your wallet.");
          if (!metadata.name || !metadata.description || !metadata.image)
            throw new Error("Fill in all NFT details.");

          const priceNumber = parsePriceToNumber(price);
          if (priceNumber === null) throw new Error("Enter a valid price.");

          setIsMinting(true);
          setTxHash(null);
          setClaimTxHash(null);
          setTokenId(null);

          // Get contract & next token id
          const contract = await getContract({
            address: CONTRACT_ADDRESS,
            chain: etherlinkTestnet,
            client,
          });
          const newTokenId = await nextTokenIdToMint({
            contract,
          });
          setTokenId(newTokenId);

          // 1. Lazy mint NFT
          const lazyMintTx = lazyMint({
            contract,
            nfts: [
              {
                name: metadata.name,
                description: metadata.description,
                image: metadata.image,
              },
            ],
          });
          const lazyMintResult = await sendTransaction({
            transaction: lazyMintTx,
            account,
          });
          setTxHash(lazyMintResult?.transactionHash || null);

          // 2. Set claim conditions
          const claimCondTx = setClaimConditions({
            contract,
            tokenId: newTokenId,
            phases: [
              {
                maxClaimableSupply: BigInt(maxSupply || "1"),
                maxClaimablePerWallet: 1n,
                currencyAddress: NATIVE_TOKEN_ADDRESS,
                price: priceNumber,
                startTime: new Date(),
              },
            ],
          });
          const claimCondTxResult = await sendTransaction({
            transaction: claimCondTx,
            account,
          });
          setClaimTxHash(claimCondTxResult?.transactionHash || null);

          setIsMinting(false);
          return lazyMintResult;
        }}
        disabled={isMinting}
      >
        {isMinting ? "Creating..." : "Create Badge"}
      </TransactionButton>

      {txHash && (
        <div className="mt-4">
          <a
            href={`${EXPLORER_PREFIX}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold underline"
          >
            View NFT creation on Etherlink Explorer →
          </a>
        </div>
      )}
      {claimTxHash && (
        <div className="mt-2">
          <a
            href={`${EXPLORER_PREFIX}${claimTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 font-semibold underline"
          >
            View claim condition transaction →
          </a>
        </div>
      )}
      {tokenId !== null && (
        <div className="mt-4 space-y-4">
          <div className="text-green-800 bg-green-100 rounded p-2">
            <b>Badge ready to claim!</b>
            <br />
            <span>
              <span className="text-xs">tokenId:</span> {tokenId.toString()}
            </span>
          </div>

          {selectedCampaign && selectedParticipant && tokenId && (
            <button
              onClick={createNFTReward}
              disabled={isSubmittingReward}
              className={`w-full p-2 rounded ${
                isSubmittingReward
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmittingReward ? "Sending..." : "Sending NFT to Participant"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}