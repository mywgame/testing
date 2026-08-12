# MetaFirm Local Key & HD Wallet Generator

A secure, offline, zero-dependency (other than `ethers` and `tsx`) developer utility to generate a BIP39 mnemonic phrase, derive hierarchical deterministic (HD) wallets with extended keys (`XPUB` and `XPRIV`), and create standalone hot wallets for BSC, Polygon, and TRON testnet validation.

This tool is designed to run completely on your local machine. It does not send any data over the internet, ensuring private keys and mnemonics remain secure.

---

## What It Generates

1. **BIP39 Mnemonic Phrase**: A 12-word phrase to serve as your master seed.
2. **Hierarchical Deterministic (HD) Wallets**:
   - **BSC & Polygon (EVM)**: Derived on the standard Ethereum derivation path `m/44'/60'/0'/0`.
   - **TRON**: Derived on the standard TRON derivation path `m/44'/195'/0'/0`.
   - **XPUB (Extended Public Key)**: Used by MetaFirm / Tatum to dynamically generate distinct user deposit addresses.
   - **XPRIV (Extended Private Key)**: Used to securely sign sweep transactions during automated custody flows.
3. **Standalone Hot Wallets**:
   - Unique standalone private keys for each chain, acting as your automated settlement/sweep nodes.
4. **Pre-formatted `.env` lines**: Ready-to-copy environment configurations with all generated parameters.

---

## How to Run the Tool

### Option A: Run directly in this repository (Recommended)

Since this repository is already fully configured with `ethers` and `tsx`, you can execute the generator from the root directory with a single command:

```bash
npx tsx tools/wallet-generator/generator.ts
```

---

### Option B: Run as a standalone tool anywhere else

If you want to move this folder to an isolated offline machine:

1. Copy the `tools/wallet-generator/` folder to your offline machine.
2. Inside that directory, create a `package.json` file:

```json
{
  "name": "metafirm-wallet-generator",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "ethers": "^6.17.0"
  },
  "devDependencies": {
    "tsx": "^4.21.0",
    "typescript": "^5.0.0"
  }
}
```

3. Install the dependencies:
```bash
npm install
```

4. Run the script:
```bash
npx tsx generator.ts
```

---

## Derivation Security & Verifiability

- **Standard Derivation Paths**: The EVM chains utilize path `m/44'/60'/0'/0` and TRON utilizes `m/44'/195'/0'/0`. These paths are universally compatible with major wallets like MetaMask, Trust Wallet, and Ledger.
- **Base58Check TRON Addresses**: Ethers.js outputs EVM-formatted hexadecimal addresses by default. The utility includes a native implementation of the TRON Base58Check conversion algorithm, transforming Ethereum public addresses directly into valid TRON addresses starting with `T` without needing bulky third-party SDKs.
- **Deterministic Checksum**: The address calculation includes double SHA-256 checksum verification, preventing any manual encoding error.
