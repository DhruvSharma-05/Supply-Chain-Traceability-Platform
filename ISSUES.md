# GitHub Issues — Refactor to a Real dApp

Paste each block below into GitHub → **Issues → New issue**. Titles are the `##` headings.
Suggested labels are listed per issue; create them first if they don't exist.

**Target:** Real dApp on Sepolia · Vite + TypeScript + wagmi/viem · portfolio-focused · part-time solo.

Suggested labels to create up front:
`epic`, `phase-0`…`phase-7`, `contracts`, `frontend`, `infra`, `bug`, `tech-debt`, `docs`, `good-first-task`.

---

## [EPIC] Refactor Food Traceability into a real on-chain dApp

**Labels:** `epic`

### Summary
The repo currently ships a polished React UI backed entirely by **mock, in-memory data** — the frontend never calls the deployed `FoodTraceability` smart contract. This epic tracks rebuilding the project into a genuine dApp: a tested contract deployed to Sepolia, a modern Vite + TypeScript + wagmi/viem frontend that performs real on-chain transactions, and honest documentation.

### Current state (baseline)
- ✅ `contracts/FoodTraceability.sol` — complete and deployable (OZ v5 `Ownable`).
- ❌ Frontend (`Web3Context.js`) uses hardcoded mock arrays + `setTimeout` to *simulate* blockchain writes. No `ethers.Contract`, no ABI, no contract address.
- ❌ Zero tests for `FoodTraceability` (only leftover `Lock` scaffolding).
- ❌ `frontend/` is a nested git repo (gitlink), not part of the main repo.
- ❌ README describes features/tests/layout that don't exist.

### Target architecture
- Monorepo (npm workspaces): `contracts/` + `frontend/`.
- Contract source of truth; UI schema derived from the ABI (typed).
- wagmi/viem hooks replace the hand-rolled context. No mock data.
- On-chain only (testnet gas is free) — no IPFS / indexer unless proven necessary.
- Deployed + verified on Sepolia; frontend hosted on Vercel.

### Phases
- [ ] #PHASE0 — Repo hygiene & foundation
- [ ] #PHASE1 — Contract hardening + full test suite
- [ ] #PHASE2 — Frontend foundation (Vite + TS + wagmi)
- [ ] #PHASE3 — Data model alignment
- [ ] #PHASE4 — Wire pages to the contract
- [ ] #PHASE5 — History & analytics from real data
- [ ] #PHASE6 — Polish
- [ ] #PHASE7 — Testnet deploy & docs

### Definition of done
A publicly reachable frontend on Sepolia where a user connects a wallet, creates a product as a Farmer, moves it through the supply chain, and views real on-chain history — with no mock data anywhere in the codebase.

---

## [Phase 0] Repo hygiene & foundation

**Labels:** `phase-0`, `infra`
**Estimate:** ~2–3 evenings

### Goal
One clean monorepo, no dead scaffolding, CI green. Every later phase depends on this.

### Tasks
- [ ] Consolidate `frontend/.git` into the root repo as npm workspaces (`contracts/` + `frontend/` packages). See #BUG-nested-git.
- [ ] Delete dead scaffolding: `test/Lock.js`, `ignition/modules/Lock.js`. See #BUG-lock-scaffolding.
- [ ] Add GitHub Actions CI: compile contracts, run contract tests, lint/build frontend on push + PR.
- [ ] Add root `README` describing *current* reality; remove false claims. See #BUG-readme-drift.
- [ ] Add `.editorconfig` + Prettier/ESLint config shared where sensible.

### Acceptance criteria
- `git status` clean; single repo, no gitlink for `frontend`.
- `npm test` (contracts) and `npm run build` (frontend) both run from root.
- CI passes on a fresh push.

---

## [Phase 1] Contract hardening + full test suite

**Labels:** `phase-1`, `contracts`
**Estimate:** ~1 week

### Goal
`FoodTraceability.sol` is trustworthy and fully tested before any frontend depends on it.

### Tasks
- [ ] Write Hardhat tests covering every function and every `require`/revert path:
  - [ ] `registerStakeholder` (onlyOwner, overwrite behavior)
  - [ ] `createFoodProduct` (onlyStakeholder + onlyRole Farmer, id increment, history seed, event)
  - [ ] `updateProductState` (onlyProductOwner, history append, event)
  - [ ] `transferProduct` (recipient must be active, role→field mapping, double-listing in `userProducts`)
  - [ ] `reportQualityIssue`, view functions, `isExpired`, `getProductsByState`
- [ ] Address findings surfaced by tests:
  - [ ] State-sequence enforcement — see #BUG-state-sequence.
  - [ ] Decide whether `transferProduct` should guard against re-adding existing products to `userProducts`.
- [ ] Lock the schema; export + commit the ABI artifact the frontend will import.
- [ ] Add coverage reporting (`solidity-coverage`).

### Acceptance criteria
- `npx hardhat test` green with meaningful coverage (target ≥ 90% lines).
- ABI committed to a known path consumed by the frontend.

---

## [Phase 2] Frontend foundation (Vite + TypeScript + wagmi)

**Labels:** `phase-2`, `frontend`
**Estimate:** ~1 week

### Goal
A modern frontend shell that connects a real wallet and reads from the contract — no features yet.

### Tasks
- [ ] Scaffold new Vite + TypeScript app; port the existing MUI theme (green/orange).
- [ ] Replace the manual `useState` + `switch` navigation with react-router. See #BUG-dead-deps.
- [ ] Configure wagmi/viem: chains (Hardhat local + Sepolia), connectors, RPC via env (Alchemy/Infura key).
- [ ] Wallet connect/disconnect flow + account/network display.
- [ ] Typed contract config generated from the Phase 1 ABI.
- [ ] Delete the mock `Web3Context` entirely; introduce thin typed contract hooks. See #BUG-mock-context.

### Acceptance criteria
- Connect MetaMask, app calls `getTotalProducts()` against a locally deployed contract and renders the real value.
- No mock arrays imported anywhere.

---

## [Phase 3] Data model alignment

**Labels:** `phase-3`, `frontend`, `contracts`
**Estimate:** ~3–5 evenings

### Goal
Eliminate schema drift between UI and contract; contract is the source of truth. See #BUG-schema-drift.

### Tasks
- [ ] Map every UI field to a contract field; list orphans (`qualityScore`, `rating`, name-string owners vs addresses).
- [ ] **Decision:** add `qualityScore`/`rating` to the contract, or drop them from the UI? (Recommended: drop the fluff for portfolio honesty.)
- [ ] Generate TS types from the ABI so the UI cannot drift again.
- [ ] Define display helpers (address → friendly label, enum → human state/role).

### Acceptance criteria
- TS build passes; no UI field lacks an on-chain source (or a documented derived value).

---

## [Phase 4] Wire pages to the contract

**Labels:** `phase-4`, `frontend`
**Estimate:** ~2–3 weeks

### Goal
Replace simulated operations with real transactions — one page per PR.

### Tasks (in order)
- [ ] Products list — read `getTotalProducts` + `getProduct`.
- [ ] Product detail / Tracking — read `getProductHistory`.
- [ ] Create Product — write, Farmer-gated.
- [ ] Stakeholders + register — write, Admin/owner-gated (note: `registerStakeholder` is `onlyOwner`; UX change vs current "pick any account").
- [ ] Update state / Transfer product — write, owner-gated.
- [ ] Marketplace — wire to transfer flow.
- [ ] Admin Supply Chain Simulator — sequence of real txs.
- [ ] Standard tx UX everywhere: pending / confirming / success / error (wagmi).

### Acceptance criteria
- Each page demoably performs its real on-chain action against a local node.
- Role gating reflects the actual contract, not mock roles.

---

## [Phase 5] History & analytics from real data

**Labels:** `phase-5`, `frontend`
**Estimate:** ~1 week

### Goal
Replace 100%-mocked analytics/history with real on-chain data.

### Tasks
- [ ] Tracking history rendered from `getProductHistory`.
- [ ] Analytics dashboard derived from contract reads / event logs via viem (counts by state, by category, etc.).
- [ ] Remove mock `salesData` / `qualityData` arrays.
- [ ] Decide pagination/perf approach if product count grows (defer indexer unless needed).

### Acceptance criteria
- Dashboards reflect actual products you created; no mock arrays remain in the codebase.

---

## [Phase 6] Polish

**Labels:** `phase-6`, `frontend`
**Estimate:** ~1 week

### Goal
Portfolio-grade UX.

### Tasks
- [ ] Real QR codes encoding `{ contractAddress, chainId, productId }` → deep-link to a public tracking page.
- [ ] PDF/CSV export generated from real data (jspdf already a dep).
- [ ] Loading skeletons, empty states, error boundaries.
- [ ] Mobile responsiveness pass.
- [ ] Remove dead components/deps surfaced earlier (`NetworkChecker` if unused, `HomePage`). See #BUG-dead-deps.

### Acceptance criteria
- QR scan opens a working public tracking view; exports contain real data.

---

## [Phase 7] Testnet deploy & docs

**Labels:** `phase-7`, `infra`, `docs`
**Estimate:** ~3–5 evenings

### Goal
Publicly demoable.

### Tasks
- [ ] Deploy contract to Sepolia; verify on Etherscan.
- [ ] Seed demo data (stakeholders + a few products through the chain).
- [ ] Host frontend on Vercel pointed at Sepolia; env-configured contract address.
- [ ] Final README + architecture diagram + short demo GIF/script.
- [ ] Document faucet/RPC setup for contributors.

### Acceptance criteria
- A public URL where anyone can connect a wallet and trace a product on Sepolia.

---

# Bug / finding issues

These are concrete defects discovered during the codebase review. They are referenced by the phase issues above.

---

## [BUG] Frontend never calls the smart contract (all data is mocked)

**Labels:** `bug`, `frontend`, `tech-debt`
**Anchor:** `#BUG-mock-context`

`frontend/src/context/Web3Context.js` holds the entire dataset as hardcoded arrays (`initialProducts`, `initialStakeholders`, `initialSalesData`, `initialQualityData`) in React state. Every "blockchain" write (`createProduct`, `updateProductState`, `simulateFullSupplyChain`, `resetProductToHarvested`) is a `setTimeout` that mutates local state and resolves a fake success. There is no `ethers.Contract` instantiation, no ABI import, and no contract address anywhere in the frontend.

**Impact:** The app is a UI prototype, not a dApp. This is the central issue the refactor exists to fix.
**Resolution:** Addressed across Phase 2 (#PHASE2) and Phase 4 (#PHASE4).

---

## [BUG] `frontend/` is a nested git repo (gitlink), not part of the main repo

**Labels:** `bug`, `infra`
**Anchor:** `#BUG-nested-git`

`frontend/` contains its own `.git`, so the root repo only tracks a pointer (shows as `m frontend` in `git status`). Frontend code/history isn't actually versioned in the main repo.

**Resolution:** Phase 0 (#PHASE0) — consolidate into npm-workspaces monorepo.

---

## [BUG] Dead `Lock` scaffolding for a contract that doesn't exist

**Labels:** `tech-debt`, `good-first-task`
**Anchor:** `#BUG-lock-scaffolding`

`test/Lock.js` and `ignition/modules/Lock.js` are untouched Hardhat boilerplate testing a `Lock` contract that isn't in this repo. Misleading and clutters the test runner.

**Resolution:** Phase 0 (#PHASE0) — delete both.

---

## [BUG] Zero tests for `FoodTraceability` despite README claiming full coverage

**Labels:** `bug`, `contracts`
**Anchor:** `#BUG-no-tests`

The only test file is the `Lock` boilerplate. The README claims "Unit tests for all smart contract functions" and references a `FoodTraceability.test.js` that does not exist.

**Resolution:** Phase 1 (#PHASE1) — write the real suite.

---

## [BUG] README describes features, layout, and tests that don't exist

**Labels:** `docs`
**Anchor:** `#BUG-readme-drift`

README claims a `contracts/scripts` + `contracts/test` layout (actual is flat `scripts/` + `test/` at root), full test coverage, and working blockchain API wiring — none of which match reality.

**Resolution:** Phase 0 (#PHASE0) initial honest pass; finalized in Phase 7 (#PHASE7).

---

## [BUG] `updateProductState` allows arbitrary state jumps (no sequence enforcement)

**Labels:** `bug`, `contracts`
**Anchor:** `#BUG-state-sequence`

`updateProductState` / `transferProduct` accept any `State` value with no check that transitions follow the lifecycle (Harvested→Processed→Shipped→Distributed→Retail→Sold). A product can jump backward or skip stages.

**Resolution:** Phase 1 (#PHASE1) — decide and enforce valid transitions (or document intentionally permissive).

---

## [BUG] Schema drift between mock data and the contract

**Labels:** `bug`, `frontend`, `contracts`
**Anchor:** `#BUG-schema-drift`

Frontend products carry fields the contract lacks (`qualityScore`, string-name owners, ISO date strings, stakeholder `rating`); the contract uses addresses and `uint256` timestamps. These must be reconciled before integration.

**Resolution:** Phase 3 (#PHASE3).

---

## [BUG] CRA / react-scripts is deprecated

**Labels:** `tech-debt`, `frontend`
**Anchor:** `#BUG-cra`

Frontend uses `react-scripts@5` (Create React App), which is effectively unmaintained.

**Resolution:** Phase 2 (#PHASE2) — migrate to Vite + TypeScript.

---

## [BUG] Dead/unused code and dependencies

**Labels:** `tech-debt`, `good-first-task`
**Anchor:** `#BUG-dead-deps`

- `react-router-dom` is a dependency but routing is a manual `useState` + `switch` in `App.js`.
- `components/Common/NetworkChecker.js` is never imported/rendered.
- `pages/HomePage.js` appears unused (App renders `DashboardPage` as default).

**Resolution:** Resolved naturally across Phase 2 (#PHASE2) and Phase 6 (#PHASE6).
