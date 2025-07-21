# CoCreate Club – Database Documentation  
**Version**: 1.0  
**Last Updated**: [DATE]

---


ini mongo
aldobesma
3BncXHdm1eEMnSMD

## 1. Overview

CoCreate Club is a Web3 platform where fans stake tokens to become co-creators and unlock NFT-based perks. This documentation outlines the schema, relationships, access policies, and key flows used in the database design.

### 🔑 Key Features

- ✅ **Tiered NFT Badges** (`Big Fan`, `Super Fan`, `Super Duper Fan`)
- ✅ **Staking = NFT Minting** (Fans stake tokens to mint access NFTs)
- ✅ **IP Collateralization** (Creators lock NFTs to issue yield tokens – Phase 2)
- ✅ **Role-Based Access Control (RLS)** via Supabase

---

## 2. Database Schema

### Tables & Relationships

| Table               | Description                                               | Relationships                                                                 |
|--------------------|-----------------------------------------------------------|-------------------------------------------------------------------------------|
| `users`            | Stores all users (creators & fans)                        | `creator_profiles (1:1)`, `campaigns (1:N)`, `user_stakes (1:N)`              |
| `creator_profiles` | Creator-specific data (verification, stats)               | `users (1:1)`                                                                 |
| `campaigns`        | Creator-led campaigns (art, music, etc.)                  | `users (N:1)`, `campaign_tiers (1:N)`, `user_stakes (1:N)`                    |
| `campaign_tiers`   | NFT badge tiers                                           | `campaigns (N:1)`, `nft_collections (1:1)`                                    |
| `nft_collections`  | Stores deployed NFT contracts                             | `campaign_tiers (1:1)`, `campaigns (N:1)`                                     |
| `user_stakes`      | Fan NFT subscriptions (staking & NFT info)                | `users (N:1)`, `campaigns (N:1)`, `campaign_tiers (N:1)`                      |
| `ip_collateral`    | Locked NFTs as collateral (Phase 2)                       | `users (N:1)`, `yield_tokens (1:N)`                                           |
| `yield_tokens`     | Tokens backed by IP collateral (Phase 2)                  | `ip_collateral (N:1)`, `yield_token_holdings (1:N)`                           |
| `yield_token_holdings` | Fan ownership of yield tokens                        | `yield_tokens (N:1)`, `users (N:1)`                                           |
| `campaign_updates` | Creator posts (public or gated)                           | `campaigns (N:1)`, `users (N:1)`                                              |
| `scheduled_calls`  | Video calls (NFT perk – top tier)                         | `campaigns (N:1)`, `users (N:1)` (creator & fan roles)                        |
| `campaign_votes`   | Voting participation on campaign direction                | `campaigns (N:1)`, `users (N:1)`                                              |

---

## 3. Key Policies (Row-Level Security)

### Access Control Rules

| Policy Description                             | Table              |
|-----------------------------------------------|--------------------|
| Public can view only `active` campaigns        | `campaigns`        |
| Creators manage their own campaigns            | `campaigns`        |
| NFT holders can access tiered content          | `campaign_updates` |
| Fans can only unstake after lock period ends   | `user_stakes`      |
| Creators manage their own IP collateral        | `ip_collateral`    |

---

## 4. NFT-Based Access Flow

### 🧾 Creator Launches a Campaign

- Deploys NFT contract for each tier  
  → stored in `campaign_tiers.nft_contract_address`
- Sets staking requirements via `staking_amount`

### 💳 Fan Stakes Tokens → Mints NFT

- When a fan stakes:
  - `user_stakes.nft_minted = true`
  - `user_stakes.nft_token_id` is stored

### 🔓 Unlocking Perks via NFT Ownership

| Action               | Requirement                              |
|----------------------|-------------------------------------------|
| View premium updates | Has matching tier NFT (`user_stakes`)     |
| Join top-tier calls  | Owns `super_duper_fan` NFT                |
| Access voting        | Verified by NFT ownership                 |

---

## 5. Example Queries

### ✅ Check If User Has NFT Access

```sql
SELECT EXISTS (
  SELECT 1 FROM user_stakes us
  JOIN campaign_tiers ct ON us.tier_id = ct.id
  WHERE us.user_id = 'user-uuid-here'
    AND us.campaign_id = 'campaign-uuid-here'
    AND us.nft_minted = true
    AND ct.tier = 'super_duper_fan'::badge_tier
) AS has_access;

🎯 Get All Active Campaigns
sql
Copy
Edit
SELECT * FROM campaigns 
WHERE status = 'active';
🧾 List User’s NFT Badges
sql
Copy
Edit
SELECT ct.tier, ct.title, us.nft_token_id 
FROM user_stakes us
JOIN campaign_tiers ct ON us.tier_id = ct.id
WHERE us.user_id = 'user-uuid-here' AND us.nft_minted = true;
6. Deployment Notes
Prerequisites
✔ Supabase Project (with Row-Level Security enabled)

✔ Etherlink RPC (for NFT deployment)

✔ thirdweb SDK for minting logic

Setup Steps
Deploy schema using Supabase SQL Editor.

Add RLS policies to match the documented access rules.

Integrate thirdweb SDK to:

Deploy tiered NFT contracts

Mint NFTs on user staking

Track contract address and token IDs in the DB

Use user_stakes.nft_minted and nft_token_id to unlock campaign features.