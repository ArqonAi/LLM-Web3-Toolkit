/**
 * TransactionConfirm Component
 * 
 * Modal/dialog for transaction confirmation with details.
 */

import { useState } from 'react';
import { useSendTransaction } from '../hooks/useSendTransaction';

interface TransactionConfirmProps {
  to: string;
  amount: string;
  onSuccess?: (txHash: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function TransactionConfirm({
  to,
  amount,
  onSuccess,
  onCancel,
  className = '',
}: TransactionConfirmProps) {
  const { sendNative, loading, error, receipt } = useSendTransaction();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    try {
      const txReceipt = await sendNative(to, amount);
      setConfirmed(true);
      onSuccess?.(txReceipt.transactionHash);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (confirmed && receipt) {
    return (
      <div className={className}>
        <h3>Transaction Confirmed</h3>
        <div>
          <strong>Transaction Hash:</strong>
          <div style={{ wordBreak: 'break-all', fontSize: '0.9em' }}>
            {receipt.transactionHash}
          </div>
        </div>
        <div>
          <strong>Status:</strong> {receipt.status}
        </div>
        <div>
          <strong>Block:</strong> {receipt.blockNumber.toString()}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3>Confirm Transaction</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <div>
          <strong>To:</strong> {to}
        </div>
        <div>
          <strong>Amount:</strong> {amount} ETH
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleConfirm} disabled={loading}>
          {loading ? 'Sending...' : 'Confirm'}
        </button>
        <button onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
}
