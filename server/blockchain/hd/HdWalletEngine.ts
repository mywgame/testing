/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { ethers, HDNodeWallet } from 'ethers';
import * as bip39 from 'bip39';
import bs58Raw from 'bs58';

function getBs58(): { encode: (data: Uint8Array | number[]) => string; decode: (str: string) => Uint8Array } {
  const b = (bs58Raw as any)?.default || bs58Raw;
  if (typeof b?.encode === 'function') return b;
  if (typeof b?.default?.encode === 'function') return b.default;
  return bs58Raw as any;
}

export function encodeTronBase58Check(hexString: string): string {
  const bytes = Buffer.from(hexString.replace(/^0x/, ''), 'hex');
  const hash1 = crypto.createHash('sha256').update(bytes).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  const fullBytes = Buffer.concat([bytes, checksum]);
  return getBs58().encode(fullBytes);
}

export function decodeTronBase58Check(address: string): string | null {
  try {
    const bytes = getBs58().decode(address);
    if (bytes.length !== 25) return null;
    const payload = Buffer.from(bytes.subarray(0, 21));
    const checksum = Buffer.from(bytes.subarray(21, 25));
    const hash1 = crypto.createHash('sha256').update(payload).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    const actualChecksum = hash2.subarray(0, 4);

    if (checksum.toString('hex') !== actualChecksum.toString('hex')) return null;
    return payload.toString('hex'); // Returns 41... hex string
  } catch {
    return null;
  }
}

export class HdWalletEngine {
  /**
   * Derive EVM address (BSC, Polygon) for index using BIP44 m/44'/60'/0'/0/index
   */
  public deriveEvmAddress(mnemonicOrSeed: string, index: number): { address: string; privateKey: string } {
    if (!mnemonicOrSeed) {
      throw new Error('[HdWalletEngine] Mnemonic or master seed is required for derivation');
    }

    let wallet: HDNodeWallet;
    if (bip39.validateMnemonic(mnemonicOrSeed)) {
      const path = `m/44'/60'/0'/0/${index}`;
      wallet = HDNodeWallet.fromPhrase(mnemonicOrSeed, undefined, path);
    } else if (mnemonicOrSeed.startsWith('xpub') || mnemonicOrSeed.startsWith('xprv')) {
      const parent = HDNodeWallet.fromExtendedKey(mnemonicOrSeed);
      const child = parent.deriveChild(index) as HDNodeWallet;
      wallet = child;
    } else {
      // Fallback seed hashing
      const seedHex = crypto.createHash('sha256').update(`${mnemonicOrSeed}:evm:${index}`).digest('hex');
      wallet = new ethers.Wallet(`0x${seedHex}`) as unknown as HDNodeWallet;
    }

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Derive Tron TRC20 address for index using BIP44 m/44'/195'/0'/0/index
   */
  public deriveTronAddress(mnemonicOrSeed: string, index: number): { address: string; privateKey: string } {
    if (!mnemonicOrSeed) {
      throw new Error('[HdWalletEngine] Mnemonic or master seed is required for derivation');
    }

    let wallet: HDNodeWallet;
    if (bip39.validateMnemonic(mnemonicOrSeed)) {
      const path = `m/44'/195'/0'/0/${index}`;
      wallet = HDNodeWallet.fromPhrase(mnemonicOrSeed, undefined, path);
    } else if (mnemonicOrSeed.startsWith('xprv')) {
      const parent = HDNodeWallet.fromExtendedKey(mnemonicOrSeed);
      wallet = parent.deriveChild(index) as HDNodeWallet;
    } else {
      const seedHex = crypto.createHash('sha256').update(`${mnemonicOrSeed}:tron:${index}`).digest('hex');
      wallet = new ethers.Wallet(`0x${seedHex}`) as unknown as HDNodeWallet;
    }

    const uncompressedPubHex = wallet.signingKey.publicKey.replace(/^0x/, '');
    const pubKey64 = uncompressedPubHex.length === 130 ? uncompressedPubHex.slice(2) : uncompressedPubHex;
    
    const keccakHash = ethers.keccak256(`0x${pubKey64}`).replace(/^0x/, '');
    const address20 = keccakHash.slice(-40);
    const tronHex = `41${address20}`;
    const tronAddress = encodeTronBase58Check(tronHex);

    return {
      address: tronAddress,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Check if address is valid Tron format
   */
  public isValidTronAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    if (!address.startsWith('T') || address.length !== 34) return false;
    return decodeTronBase58Check(address) !== null;
  }

  /**
   * Check if address is valid EVM format
   */
  public isValidEvmAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Derive address directly from a private key for EVM or Tron networks
   */
  public deriveAddressFromPrivateKey(network: string, privateKey: string): string {
    if (!privateKey) {
      throw new Error('[HdWalletEngine] Private key is required for address derivation');
    }

    let cleanKey = privateKey.trim();
    if (!cleanKey.startsWith('0x') && !network.toUpperCase().includes('TRC20')) {
      cleanKey = `0x${cleanKey}`;
    }

    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes('TRC20') || cleanNetwork.includes('TRON')) {
      if (!cleanKey.startsWith('0x')) cleanKey = `0x${cleanKey}`;
      const wallet = new ethers.Wallet(cleanKey);
      const uncompressedPubHex = wallet.signingKey.publicKey.replace(/^0x/, '');
      const pubKey64 = uncompressedPubHex.length === 130 ? uncompressedPubHex.slice(2) : uncompressedPubHex;
      const keccakHash = ethers.keccak256(`0x${pubKey64}`).replace(/^0x/, '');
      const address20 = keccakHash.slice(-40);
      const tronHex = `41${address20}`;
      return encodeTronBase58Check(tronHex);
    } else {
      const wallet = new ethers.Wallet(cleanKey);
      return ethers.getAddress(wallet.address);
    }
  }
}

export const hdWalletEngine = new HdWalletEngine();
export default hdWalletEngine;
