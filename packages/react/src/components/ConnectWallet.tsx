/**
 * ConnectWallet Component
 * 
 * Button component for wallet connection/disconnection.
 */

import React from 'react';
import { useWallet } from '../hooks/useWallet';

interface ConnectWalletProps {
  className?: string;
  connectText?: string;
  disconnectText?: string;
  loadingText?: string;
}

export function ConnectWallet({
  className = '',
  connectText = 'Connect Wallet',
  disconnectText = 'Disconnect',
  loadingText = 'Connecting...',
}: ConnectWalletProps) {
  const { isConnected, isConnecting, connect, disconnect, address } = useWallet();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const buttonText = isConnecting
    ? loadingText
    : isConnected
    ? disconnectText
    : connectText;

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={className}
      type="button"
    >
      {buttonText}
      {isConnected && address && (
        <span style={{ marginLeft: '8px', fontSize: '0.85em', opacity: 0.8 }}>
          ({address.slice(0, 6)}...{address.slice(-4)})
        </span>
      )}
    </button>
  );
}
