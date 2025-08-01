"use client";
import React, { useState, useEffect } from "react";
import {
  getContract,
  readContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import {
  TransactionButton,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import aldoMusicImg from "@/assets/aldo_music.jpg";
import rwaImg from "@/assets/rwa.jpg";
import Image from "next/image";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

// List of contracts
const RWA_CONTRACTS = [
  {
    label: "Aldo Art",
    address: process.env.NEXT_PUBLIC_RWA_ALDO_ART!,
    image: rwaImg,
  },
  {
    label: "AMSL",
    address: process.env.NEXT_PUBLIC_RWA_AMSL!,
    image: aldoMusicImg,
  },
];

const MARKET_ADDRESS =
  process.env.NEXT_PUBLIC_RWA_MARKET_ADDRESS!; // Market/Escrow address

type ContractInfo = {
  label: string;
  address: string;
  image: any; // Add image property
};

function RwaCard({
  contractInfo,
  account,
}: {
  contractInfo: ContractInfo;
  account: ReturnType<typeof useActiveAccount>;
}) {
  const [metadata, setMetadata] = useState({
    name: "",
    symbol: "",
    decimals: 18,
    totalSupply: "",
    description: "",
  });
  const [holding, setHolding] = useState("0");
  const [marketBalance, setMarketBalance] = useState("0");
  const [amount, setAmount] = useState("1");
  const [recipient, setRecipient] = useState("");
  const [priceUsd] = useState("0.001");
  const [change24h] = useState("+0.12%");
  const [loading, setLoading] = useState(false);

  // Fetch metadata
  useEffect(() => {
    async function fetchMetadata() {
      const contract = await getContract({
        address: contractInfo.address,
        chain: etherlinkTestnet,
        client,
      });

      const name = await readContract({
        contract,
        method: "function name() view returns (string)",
        params: [],
      });
      const symbol = await readContract({
        contract,
        method: "function symbol() view returns (string)",
        params: [],
      });
      const decimals = await readContract({
        contract,
        method: "function decimals() view returns (uint8)",
        params: [],
      });
      const supply = await readContract({
        contract,
        method:
          "function totalSupply() view returns (uint256)",
        params: [],
      });

      const totalSupplyFormatted =
        Number(supply) / 10 ** Number(decimals);

      setMetadata({
        name,
        symbol,
        decimals,
        totalSupply: totalSupplyFormatted.toLocaleString(),
        description: "Real World Asset Token",
      });
    }
    fetchMetadata();
  }, [contractInfo.address]);

  // Fetch holding
  useEffect(() => {
    async function fetchHolding() {
      if (!account) {
        setHolding("0");
        return;
      }
      const contract = await getContract({
        address: contractInfo.address,
        chain: etherlinkTestnet,
        client,
      });
      const decimals = metadata.decimals;
      const balance = await readContract({
        contract,
        method:
          "function balanceOf(address) view returns (uint256)",
        params: [account.address],
      });
      const formatted =
        Number(balance) / 10 ** Number(decimals);
      setHolding(formatted.toLocaleString());
    }
    if (account && metadata.decimals) {
      fetchHolding();
    }
  }, [account, metadata.decimals, contractInfo.address]);

  // Fetch market balance
  const fetchMarketBalance = async () => {
    const contract = await getContract({
      address: contractInfo.address,
      chain: etherlinkTestnet,
      client,
    });
    const decimals = metadata.decimals;
    const balance = await readContract({
      contract,
      method:
        "function balanceOf(address) view returns (uint256)",
      params: [MARKET_ADDRESS],
    });
    setMarketBalance(
      (
        Number(balance) /
        10 ** Number(decimals)
      ).toLocaleString(),
    );
  };

  useEffect(() => {
    if (metadata.decimals) {
      fetchMarketBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.decimals, contractInfo.address]);

  const totalCost = (
    parseFloat(amount || "0") * parseFloat(priceUsd)
  ).toFixed(3);

  // Buy
  const handleBuy = async () => {
    if (!account)
      return toast.error("Connect your wallet.");
    setLoading(true);
    try {
      const contract = await getContract({
        address: contractInfo.address,
        chain: etherlinkTestnet,
        client,
      });
      const decimals = metadata.decimals;
      const mintAmount = BigInt(
        Number(amount) * 10 ** Number(decimals),
      );
      const tx = await prepareContractCall({
        contract,
        method:
          "function mintTo(address to, uint256 amount)",
        params: [account.address, mintAmount],
      });
      const { transactionHash } = await sendTransaction({
        transaction: tx,
        account,
      });
      toast.success(`Buy Success! Tx: ${transactionHash}`);
    } catch (err) {
      toast.error("Buy failed: " + (err as any)?.message);
    }
    setLoading(false);
  };

  // Sell
  const handleSell = async () => {
    if (!account)
      return toast.error("Connect your wallet.");
    setLoading(true);
    try {
      const contract = await getContract({
        address: contractInfo.address,
        chain: etherlinkTestnet,
        client,
      });
      const decimals = metadata.decimals;
      const sellAmount = BigInt(
        Number(amount) * 10 ** Number(decimals),
      );
      const tx = await prepareContractCall({
        contract,
        method:
          "function transfer(address to, uint256 amount) returns (bool)",
        params: [MARKET_ADDRESS, sellAmount],
      });
      const { transactionHash } = await sendTransaction({
        transaction: tx,
        account,
      });
      toast.success(`Sell Success! Tx: ${transactionHash}`);
      // Refresh balances after sell
      if (account && metadata.decimals) {
        const balance = await readContract({
          contract,
          method:
            "function balanceOf(address) view returns (uint256)",
          params: [account.address],
        });
        const formatted =
          Number(balance) / 10 ** Number(decimals);
        setHolding(formatted.toLocaleString());
      }
      await fetchMarketBalance();
    } catch (err) {
      toast.error("Sell failed: " + (err as any)?.message);
    }
    setLoading(false);
  };

  // Send
  const sendTx = async () => {
    if (!account) throw new Error("Connect your wallet.");
    const contract = await getContract({
      address: contractInfo.address,
      chain: etherlinkTestnet,
      client,
    });
    const decimals = metadata.decimals;
    const sendAmount = BigInt(
      Number(amount) * 10 ** Number(decimals),
    );
    const tx = await prepareContractCall({
      contract,
      method:
        "function transfer(address to, uint256 amount) returns (bool)",
      params: [recipient, sendAmount],
    });
    return tx;
  };

  return (
    <div className="p-6 my-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500">
          <Image
            src={contractInfo.image}
            alt={contractInfo.label}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {metadata.name}{" "}
            <span className="text-blue-400">
              ({metadata.symbol})
            </span>
          </h2>
          <p className="text-sm text-gray-400">
            {metadata.description}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
        <div>
          <span className="text-gray-500">
            Total Supply:
          </span>
          <p className="font-semibold">
            {metadata.totalSupply}
          </p>
        </div>
        <div>
          <span className="text-gray-500">
            Your Holding:
          </span>
          <p className="font-semibold">
            {holding} {metadata.symbol}
          </p>
        </div>
        <div>
          <span className="text-gray-500">
            Market Holding:
          </span>
          <span className="font-semibold">
            {marketBalance} {metadata.symbol}
          </span>
          <button
            onClick={fetchMarketBalance}
            className="ml-2 px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            type="button"
          >
            Refresh
          </button>
        </div>
        <div>
          <span className="text-gray-500">
            Current Price:
          </span>
          <p className="font-semibold text-green-400">
            XTZ {priceUsd}
          </p>
        </div>
        <div>
          <span className="text-gray-500">24h Change:</span>
          <p
            className={
              change24h.startsWith("+")
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {change24h}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          min="0"
          step="1"
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <div className="flex justify-between text-sm text-gray-300">
          <span>Total Cost:</span>
          <span className="font-semibold text-green-400">
            XTZ {totalCost}
          </span>
        </div>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <div className="flex space-x-4">
          <button
            className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            onClick={handleBuy}
            disabled={loading}
          >
            {loading ? "Processing..." : "Buy"}
          </button>
          <button
            className="flex-1 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            onClick={handleSell}
            disabled={loading}
          >
            {loading ? "Processing..." : "Sell"}
          </button>
          <TransactionButton
            transaction={sendTx}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            disabled={loading}
          >
            Send
          </TransactionButton>
        </div>
      </div>
    </div>
  );
}

export default function RWAOverview() {
  const account = useActiveAccount();

  return (
    <div>
      <Navbar />
      <div className="flex justify-center mb-4 mt-8">
        <ConnectButton
          client={client}
          chain={etherlinkTestnet}
        />
      </div>
      <div className="flex flex-wrap gap-8 justify-center">
        {RWA_CONTRACTS.map((contractInfo) => (
          <RwaCard
            key={contractInfo.address}
            contractInfo={contractInfo}
            account={account}
          />
        ))}
      </div>
    </div>
  );
}