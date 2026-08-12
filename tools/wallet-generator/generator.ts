/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { HDNodeWallet, Mnemonic, Wallet, getBytes } from 'ethers';

/**
 * Base58Check encoder for TRON addresses.
 * Converts an EVM address representation into TRON's Base58Check address format.
 */
function evmAddressToTronAddress(evmAddress: string): string {
  // 1. Get the 20-byte public address bytes
  const addressBytes = getBytes(evmAddress);
  
  // 2. Prepend the TRON network prefix byte (0x41 for Nile/Shasta/Mainnet)
  const prefixedBytes = new Uint8Array(21);
  prefixedBytes[0] = 0x41;
  prefixedBytes.set(addressBytes, 1);
  
  // 3. Calculate double SHA-256 checksum
  const firstHash = crypto.createHash('sha256').update(prefixedBytes).digest();
  const secondHash = crypto.createHash('sha256').update(firstHash).digest();
  const checksum = secondHash.subarray(0, 4);
  
  // 4. Append 4-byte checksum to get a 25-byte payload
  const finalBytes = new Uint8Array(25);
  finalBytes.set(prefixedBytes, 0);
  finalBytes.set(checksum, 21);
  
  // 5. Convert to Base58 string
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let num = BigInt('0x' + Buffer.from(finalBytes).toString('hex'));
  let encoded = '';
  while (num > 0n) {
    const remainder = num % 58n;
    num = num / 58n;
    encoded = ALPHABET[Number(remainder)] + encoded;
  }
  
  // Append leading '1' characters for any leading zero bytes
  for (let i = 0; i < finalBytes.length; i++) {
    if (finalBytes[i] === 0) {
      encoded = ALPHABET[0] + encoded;
    } else {
      break;
    }
  }
  
  return encoded;
}

/**
 * Core BIP39 & HD Wallet Generation Logic
 */
function generateWallets() {
  console.log('================================================================');
  console.log('         METAFIRM LOCAL TESTNET KEY & HD WALLET GENERATOR       ');
  console.log('================================================================');
  console.log('⚠️  SECURITY WARNING: Keep the printed mnemonic and private keys safe.');
  console.log('⚠️  Do not use these keys for mainnet or production environments.\n');

  // 1. Generate standard BIP39 12-word mnemonic phrase
  const tempWallet = Wallet.createRandom();
  const mnemonicObj = tempWallet.mnemonic;
  if (!mnemonicObj) {
    throw new Error('Failed to generate BIP39 mnemonic');
  }
  const mnemonic = mnemonicObj.phrase;

  console.log('🔑  1. BIP39 MNEMONIC PHRASE (12 Words):');
  console.log(`    "${mnemonic}"`);
  console.log('\n----------------------------------------------------------------\n');

  // 2. Derive BSC/Polygon HD Account (EVM Standard Path: m/44'/60'/0'/0) directly
  const evmPath = "m/44'/60'/0'/0";
  const evmNode = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), evmPath);
  const evmXpub = evmNode.neuter().extendedKey;
  const evmXpriv = evmNode.extendedKey;

  // 3. Derive TRON HD Account (TRON Standard Path: m/44'/195'/0'/0) directly
  const tronPath = "m/44'/195'/0'/0";
  const tronNode = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), tronPath);
  const tronXpub = tronNode.neuter().extendedKey;
  const tronXpriv = tronNode.extendedKey;

  console.log('🌐  2. DERIVED HD WALLETS (ACCOUNTS):');
  console.log('\n🔴 [EVM] BSC & Polygon Account Node:');
  console.log(`   Derivation Path : ${evmPath}`);
  console.log(`   Extended Public (XPUB)  : ${evmXpub}`);
  console.log(`   Extended Private (XPRIV): ${evmXpriv}`);

  console.log('\n🔵 [TRON] TRON Account Node:');
  console.log(`   Derivation Path : ${tronPath}`);
  console.log(`   Extended Public (XPUB)  : ${tronXpub}`);
  console.log(`   Extended Private (XPRIV): ${tronXpriv}`);
  console.log('\n----------------------------------------------------------------\n');

  // 5. Generate Standalone Hot Wallet Keypairs
  const bscHotWallet = Wallet.createRandom();
  const polygonHotWallet = Wallet.createRandom();
  const tronHotWalletRaw = Wallet.createRandom();
  const tronHotAddress = evmAddressToTronAddress(tronHotWalletRaw.address);

  console.log('🔥  3. HOT WALLETS (STANDALONE KEYPAIRS):');
  console.log('\n🔴 BSC Hot Wallet:');
  console.log(`   Address     : ${bscHotWallet.address}`);
  console.log(`   Private Key : ${bscHotWallet.privateKey}`);

  console.log('\n🟢 Polygon Hot Wallet:');
  console.log(`   Address     : ${polygonHotWallet.address}`);
  console.log(`   Private Key : ${polygonHotWallet.privateKey}`);

  console.log('\n🔵 TRON Hot Wallet:');
  console.log(`   Address     : ${tronHotAddress}`);
  console.log(`   Private Key : ${tronHotWalletRaw.privateKey}`);
  console.log('\n----------------------------------------------------------------\n');

  // 6. Demonstrate child address derivation (Indices 0, 1, 2)
  console.log('🎯  4. DERIVATION VERIFICATION (FIRST 3 DEPOSIT ADDRESSES):');
  
  console.log('\n🔴 BSC & Polygon Derived Addresses:');
  const evmHDWallet = HDNodeWallet.fromExtendedKey(evmXpub);
  for (let i = 0; i < 3; i++) {
    const child = evmHDWallet.deriveChild(i);
    console.log(`   Index #${i}: ${child.address}`);
  }

  console.log('\n🔵 TRON Derived Addresses:');
  const tronHDWallet = HDNodeWallet.fromExtendedKey(tronXpub);
  for (let i = 0; i < 3; i++) {
    const child = tronHDWallet.deriveChild(i);
    const tronAddress = evmAddressToTronAddress(child.address);
    console.log(`   Index #${i}: ${tronAddress}`);
  }
  console.log('\n----------------------------------------------------------------\n');

  // 7. Format environment variables for MetaFirm setup
  console.log('⚙️  5. PRE-FORMATTED .ENV CONFIGURATION (COPY-PASTE):');
  console.log('# MetaFirm Testnet Wallet Config');
  console.log('IS_TESTNET=true\n');
  
  console.log('# BSC (EVM) Secrets');
  console.log(`USDT_BEP20_XPUB=${evmXpub}`);
  console.log(`USDT_BEP20_XPRIV=${evmXpriv}`);
  console.log(`USDT_BEP20_HOT_PRIVATE_KEY=${bscHotWallet.privateKey}\n`);
  
  console.log('# Polygon (EVM) Secrets');
  console.log(`USDT_POLYGON_XPUB=${evmXpub}`);
  console.log(`USDT_POLYGON_XPRIV=${evmXpriv}`);
  console.log(`USDT_POLYGON_HOT_PRIVATE_KEY=${polygonHotWallet.privateKey}\n`);
  
  console.log('# TRON Secrets');
  console.log(`USDT_TRC20_XPUB=${tronXpub}`);
  console.log(`USDT_TRC20_XPRIV=${tronXpriv}`);
  console.log(`USDT_TRC20_HOT_PRIVATE_KEY=${tronHotWalletRaw.privateKey}\n`);
  
  console.log('================================================================');
}

// Execute generator
generateWallets();
