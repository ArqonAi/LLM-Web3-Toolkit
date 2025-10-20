/**
 * useBalance Hook
 * 
 * Fetches and tracks wallet balance.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context';
import type { Balance } from '@arqon/web3-core';

export function useBalance(address?: string) {
  const { walletManager, isConnected } = useWeb3();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!walletManager || !isConnected) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bal = await walletManager.getBalance(address);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [walletManager, isConnected, address]);

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
    }
  }, [isConnected, fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
