/**
 * useSendTransaction Hook
 * 
 * Handles transaction sending with confirmation flow.
 */

import { useState, useCallback } from 'react';
import { useWeb3 } from '../context';
import type { TransactionReceipt } from '@arqon/web3-core';

export function useSendTransaction() {
  const { walletManager } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const sendNative = useCallback(
    async (to: string, amount: string) => {
      if (!walletManager) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);
      setReceipt(null);

      try {
        const txReceipt = await walletManager.sendNative(to, amount);
        setReceipt(txReceipt);
        return txReceipt;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [walletManager]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setReceipt(null);
  }, []);

  return {
    sendNative,
    loading,
    error,
    receipt,
    reset,
  };
}
