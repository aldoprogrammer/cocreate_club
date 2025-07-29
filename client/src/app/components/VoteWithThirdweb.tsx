"use client";

import { TransactionWidget } from "thirdweb/react";
import {
  createThirdwebClient,
  defineChain,
  prepareTransaction,
} from "thirdweb";
import { useState } from "react";
import { etherlinkTestnet } from "@/lib/etherlinkChain";
import { client } from "../client";
import Modal from "./Modal";




interface VoteWithThirdwebProps {
  amount: number; // in ETH
  receiver: string; // campaign receiver address
  onSuccess?: (tx?: any) => void; // callback after payment
}

export default function VoteWithThirdweb({
  amount,
  receiver,
  onSuccess,
}: VoteWithThirdwebProps) {
  const [open, setOpen] = useState(false);

  const transaction = prepareTransaction({
    to: receiver,
    value: BigInt(Math.floor(amount * 1e18)),
    chain: etherlinkTestnet,
    client,
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex justify-center items-center w-full rounded-xl font-semibold text-sm px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Vote & Pay with Wallet
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Vote & Pay"
      >
        <TransactionWidget
          client={client}
          transaction={transaction}
          onSuccess={() => {
            setOpen(false);
            if (onSuccess) onSuccess();
          }}
          title="Vote & Pay"
          description="Pay to cast your vote on Etherlink testnet"
        />
      </Modal>
    </>
  );
}