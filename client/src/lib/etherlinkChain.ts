export const etherlinkTestnet = {
  id: 128123,
  name: "Etherlink Testnet (Ghostnet)",
  nativeCurrency: {
    name: "XTZ",
    symbol: "XTZ",
    decimals: 18,
  },
  rpc: "https://node.ghostnet.etherlink.com",
  rpcUrls: {
    default: {
      http: ["https://node.ghostnet.etherlink.com"],
    },
  },
  blockExplorers: [
    {
      name: "Etherlink Testnet Explorer",
      url: "https://testnet.explorer.etherlink.com",
    },
  ],
  chain: "etherlink-ghostnet",
  testnet: true as true, // Enforces the literal type!
};

// If you STILL get an error, forcibly cast the final object:
export const etherlinkTestnetForced = etherlinkTestnet as {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: string;
  rpcUrls: { default: { http: string[] } };
  blockExplorers: { name: string; url: string }[];
  chain: string;
  testnet: true; // not boolean!
};
