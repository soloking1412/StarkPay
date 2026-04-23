# StarkPay

**Private on-chain payroll infrastructure for Starknet.**

StarkPay enables organisations to pay contributors in USDC without exposing salary amounts, recipient wallet addresses, or treasury flows on a public block explorer. Every disbursement is verifiable on-chain, but only the employer holds a viewing key capable of reconstructing the full audit trail.

---

## The Problem

Public blockchains expose every transaction. For payroll this creates serious issues:

- **Salary transparency** — anyone can look up a contributor's address and see exactly what they earn
- **Treasury exposure** — competitors can track how much an organisation pays out, to how many people, and on what schedule
- **Target risk** — contributors with visible on-chain income become targets

Traditional payroll solutions (Sablier, Superfluid) solve streaming but not privacy. StarkPay solves privacy without sacrificing auditability.

---

## Solution

StarkPay uses a non-custodial vault contract where:

1. **Employer** deposits USDC, registers contributors with salary and payment interval
2. **Disbursement** accrues salary into each contributor's private pending balance — no direct transfer visible on explorers during processing
3. **Contributor** independently claims their balance — only the claim transaction touches the chain, and it reveals nothing about the salary schedule or other contributors
4. **Viewing key** — the employer can publish a key that unlocks the full payment history for compliance or tax reporting, without exposing real-time treasury state

---

## Live Demo

> Deployed on **Starknet Sepolia** testnet

| Contract | Address |
|---|---|
| PayrollVault | `0x04c57d059692f6a4034a63e880c0cc9913aa236e8e27cfb63760ef78426a0d82` |
| Mock USDC | `0x072cc769b06e1cedf1a2c23417fcd8b9fb6d57eec06b50e63e2df0deed9f78a4` |

**Demo reviewer wallet** (pre-funded, employer role):
- Address: `0x06a8c33470d20f18c268306730e18e59055447424a6f6d0a895b7aa0e2da014d`
- Private key: `0x4d4a7325f8b38cc22081fff941b15d55f845a7777c37b9e0ca02018c54a3611`
- Import into **Argent X** or **Braavos** → switch to Starknet Sepolia → connect to the app

Pre-loaded state: 2200 USDC in vault · 2 active contributors · pending balances ready to claim

---

## Features

**Employer**
- Deposit USDC into the vault (approve + deposit in a single multicall)
- Register contributors with wallet address, USDC salary, and payment interval (weekly / bi-weekly / monthly)
- Remove or update contributor salary at any time
- Process all due disbursements in one transaction
- Withdraw excess funds (only the portion not reserved for pending claims)
- Set a viewing key for off-chain audit trail

**Contributor**
- View accrued pending balance
- Claim salary directly to wallet at any time
- No dependency on the employer for the claim step

**Compliance**
- Payment record log stored on-chain (contributor, amount, timestamp, record ID)
- Viewing key enables employer to reconstruct full payroll history
- Contributor count and vault balance visible to employer dashboard

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Next.js Frontend                │
│  ┌────────────┐  ┌──────────────┐               │
│  │  Employer  │  │  Contributor │               │
│  │  Dashboard │  │  Dashboard   │               │
│  └─────┬──────┘  └──────┬───────┘               │
│        │                │                       │
│  starknet-react v5 + starknet.js v8             │
└────────┼────────────────┼───────────────────────┘
         │                │
         ▼                ▼
┌─────────────────────────────────────────────────┐
│           PayrollVault (Cairo v2.16)            │
│                                                 │
│  Storage                                        │
│  ├── employer: ContractAddress                  │
│  ├── token: ContractAddress (USDC)              │
│  ├── vault_balance: u256                        │
│  ├── total_pending: u256                        │
│  ├── contributors: Map<Address, ContributorInfo>│
│  ├── contributor_list: Map<u32, Address>        │
│  ├── contributor_count: u32                     │
│  ├── payment_records: Map<u32, PaymentRecord>   │
│  └── viewing_key: felt252                       │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contract | Cairo v2.16, Scarb 2.16.0 |
| Contract tests | Starknet Foundry snforge 0.57.0 |
| Deployment | sncast 0.57.0 |
| Frontend framework | Next.js 14 App Router (TypeScript) |
| Wallet integration | starknet-react v5.0.3, starknet.js v8 |
| Wallet detection | get-starknet-core v4 (Argent X, Braavos) |
| Styling | Tailwind CSS |
| Data fetching | TanStack Query v5 |

---

## Smart Contract

### ContributorInfo

```rust
struct ContributorInfo {
    salary: u256,
    interval: u64,      // seconds between payments
    last_payment: u64,  // unix timestamp of last disbursement
    pending: u256,      // accrued claimable balance
    active: bool,
}
```

### Key functions

| Function | Access | Description |
|---|---|---|
| `deposit(amount)` | Employer | Approve + transfer USDC into vault |
| `withdraw_excess(amount)` | Employer | Withdraw only the free balance (vault − total_pending) |
| `add_contributor(address, salary, interval)` | Employer | Register a contributor |
| `remove_contributor(address)` | Employer | Deactivate a contributor |
| `update_salary(address, salary)` | Employer | Update contributor salary |
| `process_all_due()` | Employer | Accrue salary for all contributors whose interval has elapsed |
| `claim()` | Contributor | Transfer accrued pending balance to wallet |
| `set_viewing_key(key)` | Employer | Publish viewing key for audit trail |

### Safety mechanisms

- `total_pending` tracker prevents withdrawing funds reserved for contributor claims
- `vault_balance >= total_pending + earned` guard on every disbursement
- Re-entrancy safe — state updated before external ERC-20 transfer
- Contributor can only claim their own balance

---

## Tests

10 unit tests, all passing:

```
snforge test
```

| Test | Description |
|---|---|
| `test_deposit` | Employer can deposit USDC |
| `test_add_contributor` | Contributor registration |
| `test_process_and_claim` | Full disburse → claim flow |
| `test_only_employer_can_add` | Access control |
| `test_cannot_double_claim` | Prevents draining pending twice |
| `test_withdraw_excess` | Safe excess withdrawal |
| `test_process_all_due` | Batch disbursement |
| `test_viewing_key` | Key storage |
| `test_update_salary` | Salary change |
| `fuzz_salary_never_exceeds_deposit` | 256-run fuzz — pending never exceeds vault |

---

## Local Setup

### Prerequisites

- [Scarb 2.16.0](https://docs.swmansion.com/scarb/)
- [Starknet Foundry 0.57.0](https://foundry-rs.github.io/starknet-foundry/)
- Node.js 18+

### Contracts

```bash
cd contracts
scarb build
snforge test
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in contract addresses and RPC URL
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_RPC_URL=https://free-rpc.nethermind.io/sepolia-juno/v0_7
NEXT_PUBLIC_VAULT_ADDRESS=<vault_contract_address>
NEXT_PUBLIC_USDC_ADDRESS=<usdc_contract_address>
```

### Deploy your own vault

```bash
cd contracts

# Declare
sncast --account <account_name> declare \
  --network sepolia \
  --contract-name PayrollVault

# Deploy (employer_address, usdc_address)
sncast --account <account_name> deploy \
  --network sepolia \
  --class-hash <class_hash> \
  --constructor-calldata <employer_address> <usdc_address>
```

---

## Project Structure

```
StarkPay/
├── contracts/
│   ├── src/
│   │   ├── payroll_vault.cairo   # Main vault contract
│   │   ├── interfaces.cairo      # IPayrollVault trait
│   │   ├── types.cairo           # ContributorInfo, PaymentRecord structs
│   │   └── mock_erc20.cairo      # Test ERC-20
│   ├── tests/
│   │   └── test_payroll_vault.cairo
│   └── Scarb.toml
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Landing page
    │   │   ├── employer/          # Employer dashboard
    │   │   └── contributor/       # Contributor dashboard
    │   ├── components/
    │   │   ├── employer/          # VaultBalance, DepositForm, ContributorForm, ...
    │   │   └── contributor/       # PendingBalance, ClaimPanel
    │   ├── hooks/
    │   │   ├── usePayrollVault.ts # All contract read/write hooks
    │   │   └── useWalletStatus.ts
    │   ├── lib/
    │   │   ├── abi.ts             # Full contract ABI
    │   │   ├── constants.ts       # Addresses, intervals
    │   │   └── format.ts          # USDC formatting utilities
    │   └── providers/
    │       └── StarknetProvider.tsx
    └── package.json
```

---

## Roadmap

- [ ] Starknet native account abstraction for gasless contributor claims
- [ ] Multi-token support (STRK, ETH, any ERC-20)
- [ ] Privacy-preserving audit export using the viewing key off-chain
- [ ] Organisation multi-sig employer role
- [ ] Recurring deposit automation via protocol-level scheduling

---

## License

MIT
