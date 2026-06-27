# 🌾 Food Traceability Platform

A blockchain dApp for end-to-end food supply-chain traceability — track products from farm to consumer on-chain, with an immutable history at every stage.

Built as a real decentralized application: a tested Solidity contract on an EVM chain, and a modern React frontend that talks to it directly via the user's wallet. No mock data — every product, stakeholder, and state change lives on-chain.

> **Status:** Fully functional locally against a Hardhat node (contract + frontend wired end-to-end). Public Sepolia deployment + hosting is the remaining step (see [Roadmap](#roadmap)).

---

## Features

- **Wallet-native** — connect with MetaMask / WalletConnect via RainbowKit.
- **Stakeholder management** — the contract owner registers farmers, processors, distributors, retailers, and consumers.
- **Product creation** — registered farmers create products on-chain (name, origin, batch, certifications, organic flag, price).
- **Lifecycle tracking** — advance a product through a strict forward-only lifecycle (Harvested → Processed → Shipped → Distributed → Retail → Sold) and transfer ownership between stakeholders, each recorded in an immutable history.
- **Product tracking** — look up any product by ID and see its full details + on-chain history; deep-linkable via a **QR code**.
- **Marketplace** — a catalog of all products; current owners can transfer items onward.
- **Admin simulator** — push a product through every remaining stage in one flow.
- **Analytics** — live charts (by category, lifecycle stage, organic share) and a recent-activity feed, all derived from on-chain data and event logs.
- **Exports** — download a product's trace as CSV or PDF.
- **Modern web3 UI** — dark, glassmorphic design system; responsive.

## Technology Stack

**Smart contract**
- Solidity `^0.8.20`, OpenZeppelin `Ownable`
- Hardhat (compile, test, deploy), `solidity-coverage`

**Frontend**
- React 19 + TypeScript (strict), Vite
- wagmi + viem (chain interaction), RainbowKit (wallet UI)
- TanStack Query (data fetching), Material UI v7 + `@mui/x-charts`
- `qrcode.react`, `jsPDF`

## Architecture

```
┌─────────────────────────────────────────────┐
│  React + TS frontend (Vite, MUI)             │
│  RainbowKit ─ wallet connection              │
├─────────────────────────────────────────────┤
│  wagmi / viem  ─ typed contract calls + logs │
├─────────────────────────────────────────────┤
│  Ethereum (Hardhat local / Sepolia)          │
│  FoodTraceability.sol                        │
└─────────────────────────────────────────────┘
```

The frontend imports the contract ABI (auto-generated to `frontend/src/abi/` and `abi/`) and derives all its TypeScript types from it, so the UI cannot drift from the contract.

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MetaMask browser extension

### Install
```bash
npm install                 # root — Hardhat + contracts
npm --prefix frontend install
cp frontend/.env.example frontend/.env
```

### Run locally (three terminals)
```bash
# Terminal A — local blockchain (leave running)
npx hardhat node

# Terminal B — deploy the contract (default address matches frontend/.env)
npx hardhat run scripts/deploy.js --network localhost

# Terminal C — frontend
npm --prefix frontend run dev
```
Open the printed URL (default **http://localhost:5173**).

### Connect MetaMask
- Add/select the **Hardhat** network: RPC `http://127.0.0.1:8545`, Chain ID `31337`.
- Import a test account printed by `npx hardhat node` (the **first** account is the contract owner/admin).
- Click **Connect** in the app.

> Restarting `npx hardhat node` resets the chain — redeploy (Terminal B) and recreate data. The deploy address stays constant on a fresh node, so `.env` keeps working.

### Typical demo flow
1. As the **admin** (account #0), register a **Farmer** on the Stakeholders page.
2. Switch MetaMask to that Farmer account and **Create a Product**.
3. View it on **Products**, then **Track** it and advance/transfer through stages.
4. Watch **Analytics** update from on-chain data.

## Smart Contract — `contracts/FoodTraceability.sol`

| Function | Access | Purpose |
|---|---|---|
| `registerStakeholder` | owner | Onboard a participant with a role |
| `createFoodProduct` | farmer | Create a product (state: Harvested) |
| `updateProductState` | product owner / admin | Advance one stage (forward-only) |
| `transferProduct` | product owner / admin | Transfer ownership + advance one stage |
| `getProduct` / `getProductHistory` | view | Read product + its full history |
| `getProductsByState` / `getTotalProducts` | view | Catalog queries |

Events (`ProductCreated`, `StateChanged`, `ProductOwnershipTransferred`, `StakeholderRegistered`, `QualityAlert`) power the frontend's activity feed and listings.

## Testing

```bash
npx hardhat test       # 28 tests covering every function and revert path
npx hardhat coverage   # 100% statements/lines/functions
npm run export:abi     # regenerate the committed ABI + typed frontend ABI
```

## Project Structure

```
blockchain-supply-chain/
├── contracts/FoodTraceability.sol
├── scripts/            # deploy.js, exportAbi.js
├── test/               # FoodTraceability.test.js
├── abi/                # committed contract ABI
├── hardhat.config.js
├── frontend/
│   ├── src/
│   │   ├── pages/      # Dashboard, Products, Stakeholders, Create, Tracking,
│   │   │               # Marketplace, Simulator, Analytics
│   │   ├── components/ # Layout, ErrorBoundary
│   │   ├── lib/        # enums, format, analytics, export helpers
│   │   ├── types/      # ABI-inferred contract types
│   │   ├── abi/        # generated typed ABI
│   │   ├── contract.ts, wagmi.ts, theme.ts
│   │   └── main.tsx, App.tsx
│   └── legacy/         # archived Create-React-App prototype (reference only)
├── ISSUES.md           # phased refactor roadmap
└── CLAUDE.md           # contributor / agent guidelines
```

## Roadmap

The project was rebuilt from a mock-data prototype into a real dApp in phases (see [`ISSUES.md`](ISSUES.md)):

- ✅ Repo hygiene & CI
- ✅ Contract hardening + full test suite
- ✅ Frontend foundation (Vite + TS + wagmi + RainbowKit)
- ✅ ABI-inferred data model
- ✅ All pages wired to the contract
- ✅ On-chain analytics
- ✅ Polish (QR, exports, responsive) + web3 dark design
- ⏳ Sepolia deployment + hosting

## License

MIT
