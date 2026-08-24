/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { keyManager } from '../keys/KeyManager.ts';
import { rpcManager } from '../rpc/RpcManager.ts';
import type { BlockchainProvider, BlockchainTransaction } from '../interfaces/BlockchainProvider.ts';
import { normalizeAmount, denormalizeAmount } from '../utils/amountUtils.ts';
import { normalizeEvmAddress } from '../utils/blockchainUtils.ts';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export class EvmRpcProvider implements BlockchainProvider {
  /**
   * Derive EVM deposit address using KeyManager / HD engine
   */
  async generateDepositAddress(network: string, derivationIndex: number): Promise<string> {
    const rawAddr = await keyManager.deriveAddress(network, derivationIndex);
    return normalizeEvmAddress(rawAddr);
  }

  /**
   * Get ERC20 token balance via JSON-RPC
   */
  async getBalance(network: string, address: string): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    if (!netConfig || !netConfig.contractAddress) return '0.00000000';

    const normalizedAddress = normalizeEvmAddress(address);
    const normalizedContract = normalizeEvmAddress(netConfig.contractAddress);

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const contract = new ethers.Contract(normalizedContract, ERC20_ABI, provider);
        const rawBal: bigint = await contract.balanceOf(normalizedAddress);
        return normalizeAmount(rawBal.toString(), netConfig.decimals);
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Failed to get token balance for ${address} on ${network}:`, err.message);
      return '0.00000000';
    }
  }

  /**
   * Get native network balance (BNB, MATIC/POL, ETH)
   */
  async getNativeBalance(network: string, address: string): Promise<string> {
    const normalizedAddress = normalizeEvmAddress(address);
    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const rawBal = await provider.getBalance(normalizedAddress);
        return ethers.formatEther(rawBal);
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Failed to get native balance for ${address} on ${network}:`, err.message);
      return '0.00000000';
    }
  }

  /**
   * Fund native gas to a deposit address for sweeping
   */
  async fundGas(network: string, toAddress: string, amount: string): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    const hotPrivateKey = netConfig?.hotPrivateKey;
    const normalizedTo = normalizeEvmAddress(toAddress);

    if (!hotPrivateKey) {
      throw new Error(
        `Hot wallet private key is not configured for network '${network}'. Please configure USDT_BEP20_HOT_PRIVATE_KEY or HOT_WALLET_PRIVATE_KEY. Native gas funding cannot proceed without a real signer.`
      );
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(hotPrivateKey, provider);
        const tx = await wallet.sendTransaction({
          to: normalizedTo,
          value: ethers.parseEther(amount),
        });
        return tx.hash;
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Native gas funding failed on ${network} to ${normalizedTo}:`, err.message);
      throw new Error(`Failed to fund native gas on ${network}: ${err.message}`);
    }
  }

  /**
   * Broadcast ERC20 token transfer or native transfer
   */
  async broadcastTransaction(
    network: string,
    toAddress: string,
    amount: string,
    fromPrivateKey?: string
  ): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    const signerKey = fromPrivateKey || netConfig?.hotPrivateKey;
    const normalizedTo = normalizeEvmAddress(toAddress);

    if (!signerKey) {
      throw new Error(
        `Hot wallet private key is not configured for network '${network}'. Please configure USDT_BEP20_HOT_PRIVATE_KEY or HOT_WALLET_PRIVATE_KEY.`
      );
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(signerKey, provider);

        if (netConfig?.contractAddress) {
          const normalizedContract = normalizeEvmAddress(netConfig.contractAddress);
          const contract = new ethers.Contract(normalizedContract, ERC20_ABI, wallet);
          const parsedAmount = denormalizeAmount(amount, netConfig.decimals);
          const tx = await contract.transfer(normalizedTo, parsedAmount);
          return tx.hash;
        } else {
          const tx = await wallet.sendTransaction({
            to: normalizedTo,
            value: ethers.parseEther(amount),
          });
          return tx.hash;
        }
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Broadcast transaction failed on ${network}:`, err.message);
      throw new Error(`Failed to broadcast transaction on ${network}: ${err.message}`);
    }
  }

  /**
   * Broadcast native coin transfer (e.g. BNB or POL/MATIC) signed with a given private key
   */
  async broadcastNativeTransaction(
    network: string,
    toAddress: string,
    amount: string,
    fromPrivateKey?: string
  ): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    const signerKey = fromPrivateKey || netConfig?.hotPrivateKey;
    const normalizedTo = normalizeEvmAddress(toAddress);

    if (!signerKey) {
      throw new Error(
        `Signer private key is required for native transfer on network '${network}'.`
      );
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(signerKey, provider);

        const balance = await provider.getBalance(wallet.address);
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice ?? ethers.parseUnits('3', 'gwei');
        const gasLimit = 21000n;
        const txCost = gasLimit * gasPrice;

        let sendValue = ethers.parseEther(amount);

        // When sweeping native coin (e.g. BNB/POL), total cost = sendValue + txCost.
        // If sendValue + txCost exceeds current balance, auto-deduct the minimal tx fee
        if (sendValue + txCost > balance) {
          if (balance <= txCost) {
            throw new Error(
              `Address native balance (${ethers.formatEther(balance)}) is lower than network transaction fee (${ethers.formatEther(txCost)}).`
            );
          }
          sendValue = balance - txCost;
        }

        const tx = await wallet.sendTransaction({
          to: normalizedTo,
          value: sendValue,
          gasLimit,
          gasPrice,
        });
        return tx.hash;
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Broadcast native transaction failed on ${network}:`, err.message);
      throw new Error(`Failed to broadcast native transaction on ${network}: ${err.message}`);
    }
  }

  /**
   * Validate EVM address
   */
  async validateAddress(_network: string, address: string): Promise<boolean> {
    if (!address || typeof address !== 'string') return false;
    const trimmed = address.trim();
    if (!trimmed.startsWith('0x')) return false;
    return ethers.isAddress(normalizeEvmAddress(trimmed));
  }

  /**
   * Fetch transaction details and verify confirmations
   */
  async getTransaction(network: string, txHash: string): Promise<BlockchainTransaction | null> {
    const netConfig = blockchainConfig.networks[network];
    const decimals = netConfig?.decimals ?? 18;

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const [tx, receipt, currentBlock] = await Promise.all([
          provider.getTransaction(txHash),
          provider.getTransactionReceipt(txHash),
          provider.getBlockNumber(),
        ]);

        if (!tx || !receipt) {
          throw new Error(`Transaction ${txHash} or receipt not found on RPC endpoint (${rpcUrl})`);
        }

        const isSuccessful = receipt.status === 1;
        const txBlock = receipt.blockNumber || currentBlock;
        const confirmations = Math.max(1, currentBlock - txBlock + 1);

        let amount = '0.00000000';
        let sender = tx.from;
        let receiver = tx.to || '';

        // Interface for parsing ERC20 transfer log
        const iface = new ethers.Interface(ERC20_ABI);
        for (const log of receipt.logs) {
          const isContractMatch = !netConfig?.contractAddress || log.address.toLowerCase() === netConfig.contractAddress.toLowerCase();
          try {
            const parsedLog = iface.parseLog({ topics: [...log.topics], data: log.data });
            if (parsedLog && parsedLog.name === 'Transfer') {
              if (isContractMatch || receiver === tx.to) {
                sender = parsedLog.args[0];
                receiver = parsedLog.args[1];
                amount = normalizeAmount(parsedLog.args[2].toString(), decimals);
                if (isContractMatch) break;
              }
            }
          } catch {
            // Ignore non-standard logs
          }
        }

        if (amount === '0.00000000' && tx.value > 0n) {
          amount = ethers.formatEther(tx.value);
        }

        return {
          hash: txHash,
          amount,
          sender,
          receiver,
          confirmations,
          isSuccessful,
        };
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Failed to fetch transaction ${txHash} on ${network}:`, err.message);
      return null;
    }
  }
}

export const evmRpcProvider = new EvmRpcProvider();
export default evmRpcProvider;
