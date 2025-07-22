"use client";
import { useState } from "react";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc1155";
import { getContract, sendTransaction } from "thirdweb";
import {
  TransactionButton,
  useActiveAccount,
  ConnectButton,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import { nextTokenIdToMint } from "thirdweb/extensions/erc1155";

const CONTRACT_ADDRESS = "0xf51e2e32821509771b212734dc594cea5f89d634";
const EXPLORER_PREFIX = "https://testnet.explorer.etherlink.com/tx/";
const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export default function DeployNFTasBadge() {
  const account = useActiveAccount();
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    image: undefined as File | undefined,
  });
  const [price, setPrice] = useState(""); // user-input
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<bigint | null>(null);

  // String-->float for price (XTZ, not wei, Etherlink expects float price)
  const parsedPrice = Number(price || "0");

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
      <h2 className="text-xl font-bold">Create Your NFT Badge</h2>
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
      <input
        type="number"
        min="0"
        step="0.0001"
        placeholder="Price for claim (XTZ)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <TransactionButton
        transaction={async () => {
          if (!account) throw new Error("Connect your wallet.");
          if (!metadata.name || !metadata.description || !metadata.image)
            throw new Error("Fill in all NFT details.");
          if (!price || isNaN(parsedPrice) || parsedPrice < 0)
            throw new Error("Enter a valid price.");

          setIsMinting(true);
          setTxHash(null);
          setClaimTxHash(null);
          setTokenId(null);

          const contract = await getContract({
            address: CONTRACT_ADDRESS,
            chain: etherlinkTestnet,
            client,
          });

          // 1. Get the next tokenId to mint BEFORE lazy mint!
          const newTokenId = await nextTokenIdToMint({ contract });
          setTokenId(newTokenId);

          // 2. Lazy Mint
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

          // 3. Set Claim Conditions for the new tokenId
          const setClaimTx = setClaimConditions({
            contract,
            tokenId: newTokenId,
            phases: [
              {
                maxClaimableSupply: 100n,
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
          setClaimTxHash(claimResult?.transactionHash || null);

          setIsMinting(false);
          return lazyMintResult;
        }}
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
