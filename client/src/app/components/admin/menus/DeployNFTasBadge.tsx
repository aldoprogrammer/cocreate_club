"use client";
import React, { useState } from "react";
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

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const EXPLORER_PREFIX = process.env.NEXT_PUBLIC_EXPLORER_PREFIX!;
const NATIVE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS!;

export default function DeployNFTasBadge() {
  const account = useActiveAccount();
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    image: undefined as File | undefined,
  });
  const [price, setPrice] = useState("0.001");
  const [maxSupply, setMaxSupply] = useState("1");
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<bigint | null>(null);

  // Helper: parse price string to number (in ether)
  function parsePriceToNumber(priceStr: string): number | null {
    const priceNum = Number(priceStr);
    if (!priceStr || isNaN(priceNum) || priceNum < 0) return null;
    return priceNum;
  }

  let claimInfo = "";
  if (maxSupply && Number(maxSupply) > 0) {
    claimInfo = `Only ${maxSupply} people can claim this Top Spender NFT Badge.`;
  } else {
    claimInfo = "Isi jumlah maksimal supporter";
  }

  return (
    <div className="p-4 space-y-4 bg-white text-black rounded-xl shadow-lg max-w-md">
      <ConnectButton
        client={client}
        chain={etherlinkTestnet}
        // By default, uses standard wallets available in thirdweb.
        // You may optionally specify wallets={[wallet1, wallet2, ...]}
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
      <label htmlFor="">Price for claim 0.001 (XTZ)</label>
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
      {/* <input
        type="number"
        min="1"
        step="1"
        placeholder="Total supply (max supporters)"
        value={maxSupply}
        disabled
        className="w-full p-2 border rounded"
      /> */}
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

          // 2. Set claim conditions (using the recommended API)
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
        <div className="mt-4 text-green-800 bg-green-100 rounded p-2">
          <b>Badge ready to claim!</b>
          <br />
          <span>
            <span className="text-xs">tokenId:</span> {tokenId.toString()}
          </span>
        </div>
      )}
    </div>
  );
}
