/**
 * Web3 React Context
 * 
 * Provides wallet state management across React application.
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { WalletManager, WalletConnection, Chain } from '@arqon/web3-core';

interface Web3ContextValue {
  walletManager: WalletManager | null;
  connection: WalletConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
  chains: Chain[];
  defaultChain: Chain;
  autoConnect?: boolean;
}

export function Web3Provider({ children, chains, defaultChain, autoConnect = false }: Web3ProviderProps) {
  const [walletManager] = useState(() => new WalletManager({ chains, defaultChain, autoConnect }));
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const conn = await walletManager.connect('metamask');
      setConnection(conn);
    } catch (err: any) {
      setError(err.message);
      setConnection(null);
    } finally {
      setIsConnecting(false);
    }
  }, [walletManager]);

  const disconnect = useCallback(async () => {
    try {
      await walletManager.disconnect();
      setConnection(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [walletManager]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  const value: Web3ContextValue = {
    walletManager,
    connection,
    isConnected: connection?.connected || false,
    isConnecting,
    error,
    connect,
    disconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}
