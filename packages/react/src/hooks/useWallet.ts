/**
 * useWallet Hook
 * 
 * Provides wallet connection state and methods.
 */

import { useWeb3 } from '../context';

export function useWallet() {
  const { connection, isConnected, isConnecting, error, connect, disconnect } = useWeb3();

  return {
    address: connection?.address,
    chainId: connection?.chainId,
    provider: connection?.provider,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
