"use client";
import React, { useState } from "react";
import {
  lazyMint,
  setClaimConditions,
  nextTokenIdToMint,
  claimTo,
} from "thirdweb/extensions/erc1155";
import { getContract, sendTransaction } from "thirdweb";
import {
  TransactionButton,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { smartWallet } from "thirdweb/wallets";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const EXPLORER_PREFIX =
  process.env.NEXT_PUBLIC_EXPLORER_PREFIX!;
const NATIVE_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS!;

export default function DeployNFTasBadge() {
  const account = useActiveAccount();
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    image: undefined as File | undefined,
  });
  const [price, setPrice] = useState("");
  const [maxSupply, setMaxSupply] = useState("100");

  // UX states
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<
    string | null
  >(null);
  const [mintTxHash, setMintTxHash] = useState<
    string | null
  >(null);
  const [tokenId, setTokenId] = useState<bigint | null>(
    null,
  );

  const parsedPrice = Number(price || "0");

  const sponsorWallet = smartWallet({
    chain: etherlinkTestnet,
    sponsorGas: true,
  });

  let claimInfo = "";
  if (maxSupply && Number(maxSupply) > 0) {
    claimInfo =
      maxSupply +
      " people can claim this NFT Badge to support your campaign.";
  } else {
    claimInfo = "Isi jumlah maksimal supporter";
  }

  return (
    <div className="p-4 space-y-4 bg-white text-black rounded-xl shadow-lg max-w-md">
      <ConnectButton
        client={client}
        chain={etherlinkTestnet}
        wallets={[sponsorWallet]}
      />

      {account ? (
        <div className="text-green-900 bg-green-100 rounded p-2 my-2 font-mono text-xs">
          Connected: {account.address}
        </div>
      ) : (
        <div className="text-gray-900 bg-gray-100 rounded p-2 my-2">
          Not connected
        </div>
      )}

      <h2 className="text-xl font-bold">
        Create Your NFT Badge
      </h2>
      <input
        type="text"
        placeholder="Name"
        value={metadata.name}
        onChange={(e) =>
          setMetadata({ ...metadata, name: e.target.value })
        }
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
      <input
        type="number"
        min="0"
        step="0.0001"
        placeholder="Price for claim (XTZ)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        min="1"
        step="1"
        placeholder="Total supply (max supporters)"
        value={maxSupply}
        onChange={(e) => setMaxSupply(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <div className="text-xs text-gray-600 mb-2">
        {claimInfo}
      </div>

      <TransactionButton
        transaction={async () => {
          if (!account)
            throw new Error("Connect your wallet.");
          if (
            !metadata.name ||
            !metadata.description ||
            !metadata.image
          )
            throw new Error("Fill in all NFT details.");
          if (
            !price ||
            isNaN(parsedPrice) ||
            parsedPrice < 0
          )
            throw new Error("Enter a valid price.");

          setIsMinting(true);
          setTxHash(null);
          setClaimTxHash(null);
          setMintTxHash(null);
          setTokenId(null);

          const contract = await getContract({
            address: CONTRACT_ADDRESS,
            chain: etherlinkTestnet,
            client,
          });

          const newTokenId = await nextTokenIdToMint({
            contract,
          });
          setTokenId(newTokenId);

          // Lazy mint
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
          setTxHash(
            lazyMintResult?.transactionHash || null,
          );

          // Set claim conditions
          const maxClaimableSupply = BigInt(
            maxSupply || "1",
          );
          const setClaimTx = setClaimConditions({
            contract,
            tokenId: newTokenId,
            phases: [
              {
                maxClaimableSupply,
                maxClaimablePerWallet: 1n,
                currencyAddress: NATIVE_TOKEN_ADDRESS,
                price: parsedPrice,
                startTime: new Date(),
              },
            ],
          });
          const claimResult = await sendTransaction({
            transaction: setClaimTx,
            account,
          });
          setClaimTxHash(
            claimResult?.transactionHash || null,
          );

          // Pre-mint supply to your own address using claimTo
          const claimToTx = claimTo({
            contract,
            to: account.address,
            tokenId: newTokenId,
            quantity: BigInt(maxSupply),
          });
          const claimToResult = await sendTransaction({
            transaction: claimToTx,
            account,
          });
          setMintTxHash(
            claimToResult?.transactionHash || null,
          );

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
      {mintTxHash && (
        <div className="mt-2">
          <a
            href={`${EXPLORER_PREFIX}${mintTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-semibold underline"
          >
            View mint transaction →
          </a>
        </div>
      )}
      {tokenId !== null && (
        <div className="mt-4 text-green-800 bg-green-100 rounded p-2">
          <b>Badge ready to claim!</b>
          <br />
          <span>
            <span className="text-xs">tokenId:</span>{" "}
            {tokenId.toString()}
          </span>
        </div>
      )}
    </div>
  );
}
