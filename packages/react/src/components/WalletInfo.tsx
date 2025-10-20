/**
 * WalletInfo Component
 * 
 * Displays wallet address and balance information.
 */

import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';

interface WalletInfoProps {
  className?: string;
  showBalance?: boolean;
}

export function WalletInfo({ className = '', showBalance = true }: WalletInfoProps) {
  const { address, chainId, isConnected } = useWallet();
  const { balance, loading: balanceLoading } = useBalance();

  if (!isConnected || !address) {
    return (
      <div className={className}>
        <p>Not connected</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div>
        <strong>Address:</strong>{' '}
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
      
      {chainId && (
        <div>
          <strong>Chain ID:</strong> {chainId}
        </div>
      )}

      {showBalance && (
        <div>
          <strong>Balance:</strong>{' '}
          {balanceLoading
            ? 'Loading...'
            : balance
            ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
            : 'N/A'}
        </div>
      )}
    </div>
  );
}
