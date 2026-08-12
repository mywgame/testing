# MetaFirm Blockchain Architecture

> **Implementation Reference**
>
> This document defines the official blockchain architecture for the MetaFirm platform.
> It serves as the technical constitution for every blockchain-related feature.
> If implementation conflicts with this document, this specification takes priority until officially updated.

---

# Table of Contents

1. Design Principles
2. Design Goals
3. High-Level Architecture
4. Blockchain Provider
5. Multi-Chain Architecture
6. HD Wallet Architecture
7. Key Management
8. Deposit Address Management
9. Deposit Lifecycle
10. Deposit Verification
11. Treasury Architecture
12. Automatic Sweep
13. Withdrawal Flow
14. RPC Manager
15. RPC Failover
16. Security Rules
17. Chain Configuration
18. Business Logic Separation
19. Migration Strategy & Status
20. Technology Stack
21. Future Expansion
22. Business Ownership
23. Architecture Ownership

---

# 1. Design Principles

The blockchain subsystem is designed around the following principles:

- Provider independent
- Chain agnostic
- Business logic isolation
- Deterministic HD wallets
- Enterprise scalability
- Security first
- Multi-chain ready
- High availability

---

# 2. Design Goals

The architecture must support:

- Unlimited deterministic wallets
- Permanent deposit addresses
- Automatic deposit verification
- Automatic wallet credit
- Automatic and manual sweep
- Hot / Cold treasury
- Withdrawals
- Multi-chain support
- Horizontal scaling
- Future blockchain expansion

---

# 3. High-Level Architecture

```text
                     MetaFirm Platform
                             │
                     Business Services
                             │
                    BlockchainProvider
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
      RpcProvider                     TatumProvider
       (Primary)                 (Migration Only)
```

**Rules**

- Business services communicate only with `BlockchainProvider`.
- No service may directly use blockchain SDKs.

---

# 4. Blockchain Provider

Every provider must implement the same interface.

```ts
generateAddress()
verifyDeposit()
getTransaction()
getBalance()
broadcastTransaction()
estimateGas()
sweep()
withdraw()
healthCheck()
```

---

# 5. Multi-Chain Architecture

Supported initially:

- USDT (BEP20)
- USDT (Polygon)
- USDT (TRC20)

```text
BlockchainProvider
        │
 ├── EvmProvider
 │      ├── BNB Smart Chain
 │      ├── Polygon
 │      └── Ethereum
 │
 └── TronProvider
```

Future providers:

- Base
- Arbitrum
- Optimism
- Avalanche
- Solana
- Bitcoin

Adding a blockchain must require only:

1. New provider implementation
2. Chain configuration

---

# 6. HD Wallet Architecture

## Master Seed

One encrypted master seed generates unlimited deterministic wallets.

## Database

Store only:

- Deposit Address
- Derivation Index

Never permanently store individual private keys.

---

# 7. Key Management

## Runtime Flow

```text
Master Seed
      │
Derive Private Key
      │
Sign Transaction
      │
Discard From Memory
```

## Requirements

- Encrypted storage
- Never commit to Git
- Never hardcode
- Never expose via APIs
- Secure backup
- Key rotation support

Future:

- Cloud Secret Manager
- HSM

---

# 8. Deposit Address Management

Each user receives one permanent address per supported network.

| Network | Address |
|----------|---------|
| BEP20 | Permanent |
| Polygon | Permanent |
| TRC20 | Permanent |

---

# 9. Deposit Lifecycle

```text
User
 ↓
Transfer
 ↓
Blockchain
 ↓
Deposit Detection
 ↓
Verification
 ↓
Wallet Credit
 ↓
Referral Reward
 ↓
VIP Recalculation
 ↓
Activity
 ↓
Audit Log
 ↓
Automatic Sweep
 ↓
Treasury
```

---

# 10. Deposit Verification

Validation checklist:

- Transaction Hash
- Chain
- Token Contract
- Recipient Address
- Amount
- Confirmations
- Duplicate Detection

Only verified deposits may credit wallets.

---

# 11. Treasury Architecture

```text
Master Seed
      │
User Wallets
      │
Automatic Sweep
      │
Hot Wallet
      │
Cold Wallet
```

## Hot Wallet

- Daily operations
- Withdrawals
- Working liquidity

## Cold Wallet

- Long-term storage
- Manual transfer
- Maximum security

---

# 12. Automatic Sweep

Requirements:

- Automatic mode
- Manual mode
- Queue processing
- Retry support
- Duplicate protection
- Audit logging

---

# 13. Withdrawal Flow

```text
User
 ↓
Withdrawal Request
 ↓
Business Validation
 ↓
BlockchainProvider
 ↓
Broadcast Transaction
 ↓
Blockchain
 ↓
Transaction Hash
 ↓
Status Update
```

---

# 14. RPC Manager

Responsibilities:

- Endpoint health monitoring
- Automatic endpoint failover
- Retry mechanism
- Timeout handling
- Response caching
- Rate limiting

---

# 15. RPC Failover

```text
Primary
   │
Chainstack
   │
QuickNode
   │
Ankr
   │
Future Self-hosted Node
```

Tatum must never be used as an automatic failover provider.

---

# 16. Security Rules

Every blockchain operation must validate:

- Chain ID
- Network
- Token Contract
- Sender
- Recipient
- Amount
- Transaction Hash
- Confirmations

Reject:

- Duplicate transactions
- Invalid contracts
- Wrong network
- Wrong recipient
- Invalid confirmations

---

# 17. Chain Configuration

Every chain defines:

- Chain ID
- RPC URLs
- Explorer URL
- Native Currency
- Supported Tokens
- Confirmation Count
- Gas Strategy

---

# 18. Business Logic Separation

Business services never contain blockchain implementation.

Services communicate only with:

`BlockchainProvider`

---

# 19. Migration Strategy & Status

  -------------------------------------------------------------------------
           Phase Milestone                   Status      Summary
  -------------- ---------------------- ---------------- ------------------
               1 BlockchainProvider       ✅ Completed   Standardized
                 Interface                               provider interface
                                                         for all blockchain
                                                         operations.

               2 RpcProvider              ✅ Completed   Implemented
                 Infrastructure                          `RpcProvider`,
                                                         `RpcManager`, and
                                                         multi-endpoint RPC
                                                         failover.

               3 HD Wallet & Address      ✅ Completed   Implemented
                 Generation                              deterministic
                                                         BIP39/BIP44 wallet
                                                         derivation for EVM
                                                         and TRON.

               4 Deposit Verification     ✅ Completed   Implemented native
                                                         on-chain
                                                         transaction and
                                                         confirmation
                                                         verification.

               5 Balance Services         ✅ Completed   Implemented native
                                                         RPC balance
                                                         retrieval for
                                                         supported networks
                                                         and tokens.

               6 Withdrawal Engine        ✅ Completed   Implemented native
                                                         transaction
                                                         signing and
                                                         broadcasting
                                                         through
                                                         `RpcProvider`.

               7 Automatic Sweep          ✅ Completed   Implemented
                                                         automatic gas
                                                         funding and token
                                                         sweep operations.

               8 RPC Default Provider     ✅ Completed   Set `RpcProvider`
                                                         as the default
                                                         blockchain
                                                         provider via
                                                         configuration.

               9 Tatum Rollback Support   ✅ Completed   Retained
                                                         `TatumProvider` as
                                                         an optional manual
                                                         rollback
                                                         mechanism.

              10 Legacy Tatum Removal      ⏳ Pending    Remove legacy
                                                         Tatum
                                                         implementation
                                                         after long-term
                                                         production
                                                         validation.
  -------------------------------------------------------------------------

## Current Migration Status

-   **Primary Provider:** ✅ RpcProvider
-   **Legacy Provider:** ✅ TatumProvider (Manual Rollback Only)
-   **RPC Failover:** ✅ Implemented
-   **HD Wallet Engine:** ✅ Implemented
-   **Multi-Chain Support:** ✅ EVM + TRON
-   **Business Logic Compatibility:** ✅ Preserved
-   **Database Compatibility:** ✅ Preserved
-   **Production Migration:** ⏳ Monitoring & Validation

# 20. Technology Stack

Core:

- TypeScript
- ethers.js
- bip39
- bs58
- PostgreSQL
- Drizzle ORM

Future:

- HSM
- Cloud Secret Manager
- Self-hosted RPC Nodes

---

# 21. Future Expansion

Designed for:

- Ethereum
- Base
- Arbitrum
- Optimism
- Avalanche
- Solana
- Bitcoin
- Additional EVM chains
- Additional non-EVM chains

No business logic changes should be required.

---

# 22. Business Ownership

Business rules remain in:

`MetaFirm_Business_Logic_Specification.md`

This document covers only blockchain infrastructure.

---

# 23. Architecture Ownership

This document owns:

- BlockchainProvider
- RPC Architecture
- HD Wallets
- Key Management
- Deposit Addresses
- Deposit Verification
- Automatic Sweep
- Treasury
- Withdrawals
- Multi-chain Support
- Security
- Provider Interfaces

Every blockchain implementation must comply with this specification.
