"use client";
import { useState } from "react";
import { lazyMint } from "thirdweb/extensions/erc1155";
import { getContract } from "thirdweb";
import {
  TransactionButton,
  useActiveAccount,
  ConnectButton,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";

const CONTRACT_ADDRESS = "0xf51e2e32821509771b212734dc594cea5f89d634";
const EXPLORER_PREFIX = "https://testnet.explorer.etherlink.com/tx/";

export default function DeployNFTasBadge() {
  const account = useActiveAccount();
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    image: undefined as File | undefined,
  });
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

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
      <TransactionButton
        transaction={async () => {
          if (!account) throw new Error("Connect your wallet.");
          setIsMinting(true);
          setTxHash(null);
          const contract = await getContract({
            address: CONTRACT_ADDRESS,
            chain: etherlinkTestnet,
            client,
          });
          return lazyMint({
            contract,
            nfts: [
              {
                name: metadata.name,
                description: metadata.description,
                image: metadata.image,
              },
            ],
          });
        }}
        account={account}
        disabled={
          isMinting ||
          !account ||
          !metadata.name ||
          !metadata.description ||
          !metadata.image
        }
        onTransactionConfirmed={(receipt) => {
          const hash = receipt?.transactionHash || null;
          if (hash) setTxHash(hash as string);
          setIsMinting(false);
        }}
        onError={() => {
          alert("❌ Failed to create badge.");
          setIsMinting(false);
        }}
      >
        {isMinting ? "Creating..." : "Create Badge"}
      </TransactionButton>

      {/* Show link if hash is present */}
      {txHash && (
        <div className="mt-4">
          <a
            href={`${EXPLORER_PREFIX}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold underline"
          >
            View your badge mint on Etherlink Explorer →
          </a>
        </div>
      )}
    </div>
  );
}
