# CoCreate Club

**CoCreate Club** is a **gamified voting platform** on the **Etherlink Testnet (Ghostnet)** where votes carry weight based on **XTZ contributions**. The **option with the highest total XTZ wins**, not the most votes.  

Voters / Audiences get **five chances to contribute** at least a **minimum XTZ amount**, with **higher contributions boosting leaderboard rankings**.  

- The **top spender** in each campaign earns an **exclusive NFT** from the creator.  
- **All participants** receive a **reward NFT**.  
- The platform also features an **RWA (Real-World Asset) Marketplace** for **co-owning creator assets** (e.g., **art, music royalties**) as **tradable NFTs**.  

**Themed campaigns** like **The Battle of Meme Kings** make community participation **engaging, rewarding, and viral**.

---

## Features

- **Gamified Voting**:  
  Pay-to-vote system where **total XTZ determines the winner**  
  *(e.g., 1 vote of 0.009 XTZ beats 5 votes totaling 0.005 XTZ)*.

- **Leaderboard & Rewards**:  
  Top spender wins an **exclusive NFT**; all participants receive a **reward NFT**.

- **RWA Marketplace**:  
  Buy, sell, or trade **shares of creator assets** as **NFTs**.

- **Etherlink Integration**:  
  Built on **Etherlink Testnet** for **fast, low-cost transactions**.

- **Thirdweb Integration**:  
  Handles **wallet connectivity, contract interactions, and NFT minting/claiming**.

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS  
- **Blockchain:** Etherlink Testnet (Ghostnet), XTZ as native currency  
- **Thirdweb:** Wallet integration, contract interactions, ERC-1155 NFT operations  
- **Backend:** Node.js *(for campaign management and NFT reward storage)*  
- **Dependencies:** Axios, react-hot-toast, lucide-react  

---

## How It Uses Etherlink

- **Voting Transactions**:  
  Users **pay XTZ to vote**, sending transactions to a **campaign treasury address** using  
  `prepareTransaction` and `toWei` from **Thirdweb**.

- **NFT Minting & Trading**:  
  **Top spender and participant NFTs** are minted **on-chain** with **low fees**.

- **RWA Marketplace**:  
  **Asset shares are tokenized as NFTs**, with **buy/sell/transfer functions** executed via **smart contracts**.

**Configuration File:** `etherlinkChain.ts`

```ts
Chain ID: 128123
RPC: https://node.ghostnet.etherlink.com
Explorer: https://testnet.explorer.etherlink.com
```

## How It Uses Thirdweb
Thirdweb simplifies blockchain interactions:

- **Wallet Connectivity:**
ConnectButton & useActiveAccount for user authentication and signing transactions.

- **Contract Interactions:**

- **getContract** & **readContract** → fetch metadata (name, symbol, supply, balances)

- **sendTransaction** → voting, NFT minting, and claim conditions

- **ERC-1155 NFT Operations:**

- **lazyMint** → create NFT badges for campaign rewards

- **claimTo** → allow participants to claim NFTs

- **getNFT** & getOwnedTokenIds → retrieve NFT metadata & ownership

- **TransactionButton:**
Simplifies voting, RWA trading, and NFT claiming with pre-configured logic.

## Usage

### **Creators**
- Create campaigns via  
  `/components/creators/menus/Campaign.tsx`
- Set **vote options**, **minimum price**, and **upload NFT reward images**

### **Voters / Audiences / Audiences**
- Vote up to **5 times per campaign** at  
  `/campaigns/[id]/page.tsx`
- Pay **XTZ** to **influence outcomes** and **climb the leaderboard**

### **Admins**
- Deploy **NFT badges for top spenders** at  
  `/components/admin/menus/DeployNFTasBadge.tsx`
- Manage **reward distribution**

### **RWA Marketplace**
- Buy, sell, or trade **asset shares as NFTs** at  
  `/app/rwa/page.tsx`

### **NFT Collections**
- View and claim **earned NFTs** at  
  `/components/audience/menus/NFTCollections.tsx`

## License

MIT
