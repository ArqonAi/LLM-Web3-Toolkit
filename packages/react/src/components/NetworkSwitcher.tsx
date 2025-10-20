/**
 * NetworkSwitcher Component
 * 
 * Dropdown for switching between configured networks.
 */

import React, { useState } from 'react';
import { useWeb3 } from '../context';
import type { Chain } from '@arqon/web3-core';

interface NetworkSwitcherProps {
  chains: Chain[];
  className?: string;
}

export function NetworkSwitcher({ chains, className = '' }: NetworkSwitcherProps) {
  const { walletManager, connection } = useWeb3();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwitch = async (chainId: number) => {
    if (!walletManager) return;

    setSwitching(true);
    setError(null);

    try {
      await walletManager.switchChain(chainId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className={className}>
      <select
        value={connection?.chainId || ''}
        onChange={(e) => handleSwitch(Number(e.target.value))}
        disabled={switching || !connection}
      >
        <option value="" disabled>
          Select Network
        </option>
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name} {chain.testnet ? '(Testnet)' : ''}
          </option>
        ))}
      </select>

      {switching && <div style={{ fontSize: '0.85em' }}>Switching network...</div>}
      {error && (
        <div style={{ color: 'red', fontSize: '0.85em' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
