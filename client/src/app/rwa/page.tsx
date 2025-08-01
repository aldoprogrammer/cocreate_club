"use client";
import React, { useState, useEffect } from "react";
import { getContract, readContract } from "thirdweb";
import {
  TransactionButton,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "@/app/client";
import rwaImg from "@/assets/rwa.jpg";
import Image from "next/image";
import Navbar from "../components/Navbar";

const RWA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_RWA_ALDO_ART!;

export default function RWAOverview() {
  const account = useActiveAccount();
  const [metadata, setMetadata] = useState({
    name: "",
    symbol: "",
    decimals: 18,
    totalSupply: "",
    image: "",
    description: "",
  });
  const [holding, setHolding] = useState("0");
  const [amount, setAmount] = useState("1");
  const [recipient, setRecipient] = useState("");
  const [priceUsd] = useState("0.001"); // Fixed price per item
  const [change24h, setChange24h] = useState("+0.12%");

  useEffect(() => {
    async function fetchMetadata() {
      const contract = await getContract({
        address: RWA_CONTRACT_ADDRESS,
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
        method: "function totalSupply() view returns (uint256)",
        params: [],
      });

      const totalSupplyFormatted = Number(supply) / 10 ** Number(decimals);

      setMetadata({
        name,
        symbol,
        decimals,
        totalSupply: totalSupplyFormatted.toLocaleString(),
        image: rwaImg.src,
        description: "Real World Asset Token",
      });
    }
    fetchMetadata();
  }, []);

  useEffect(() => {
    async function fetchHolding() {
      if (!account) {
        setHolding("0");
        return;
      }
      const contract = await getContract({
        address: RWA_CONTRACT_ADDRESS,
        chain: etherlinkTestnet,
        client,
      });
      const decimals = metadata.decimals;
      const balance = await readContract({
        contract,
        method: "function balanceOf(address) view returns (uint256)",
        params: [account.address],
      });
      const formatted = Number(balance) / 10 ** Number(decimals);
      setHolding(formatted.toLocaleString());
    }
    if (account && metadata.decimals) {
      fetchHolding();
    }
  }, [account, metadata.decimals]);

  // Calculate total cost based on amount and fixed price
  const totalCost = (parseFloat(amount || "0") * parseFloat(priceUsd)).toFixed(
    3
  );

  return (
    <div>
      <Navbar />
      <div className="p-6 mt-12 max-w-md mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 transform hover:scale-105 transition-transform duration-300">
        <div className="flex justify-center mb-4">
          <ConnectButton client={client} chain={etherlinkTestnet} />
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500">
            <Image
              src={rwaImg}
              alt="Real World Asset"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {metadata.name}{" "}
              <span className="text-blue-400">({metadata.symbol})</span>
            </h2>
            <p className="text-sm text-gray-400">{metadata.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
          <div>
            <span className="text-gray-500">Total Supply:</span>
            <p className="font-semibold">{metadata.totalSupply}</p>
          </div>
          <div>
            <span className="text-gray-500">Your Holding:</span>
            <p className="font-semibold">
              {holding} {metadata.symbol}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Current Price:</span>
            <p className="font-semibold text-green-400">XTZ {priceUsd}</p>
          </div>
          <div>
            <span className="text-gray-500">24h Change:</span>
            <p
              className={
                change24h.startsWith("+") ? "text-green-400" : "text-red-400"
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
            <button className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
              Buy
            </button>
            <button className="flex-1 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Sell
            </button>
            <TransactionButton
            transaction={async () => {
              if (!account) throw new Error("Connect your wallet.");
              const contract = await getContract({
                address: RWA_CONTRACT_ADDRESS,
                chain: etherlinkTestnet,
                client,
              });
              const { transfer } = await import("thirdweb/extensions/erc20");
              const tx = transfer({
                contract,
                to: recipient,
                amount: amount,
              });
              return tx;
            }}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Send
          </TransactionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
