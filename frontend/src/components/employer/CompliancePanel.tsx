'use client';

import { useState } from 'react';
import { usePaymentCount, useSetViewingKey } from '@/hooks/usePayrollVault';
import { useReadContract } from '@starknet-react/core';
import { VAULT_ABI } from '@/lib/abi';
import { VAULT_ADDRESS } from '@/lib/constants';
import { Download, Key, Loader2 } from 'lucide-react';

function usePaymentRecord(index: number, enabled: boolean) {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_payment_record',
    args: [index],
    enabled,
  });
}

export function CompliancePanel() {
  const { data: count } = usePaymentCount();
  const total = count !== undefined ? Number(count) : 0;
  const [viewingKey, setViewingKey] = useState('');
  const [keyTxHash, setKeyTxHash] = useState('');
  const [keyError, setKeyError] = useState('');
  const { execute: setKey, isPending: settingKey } = useSetViewingKey();

  const handleExport = () => {
    const notice = `Payment records export requires on-chain reads.\nTotal records: ${total}\nVault: ${VAULT_ADDRESS}\n\nIntegrate with your preferred Starknet indexer or call get_payment_record(i) for i in 0..${total}.`;
    const blob = new Blob([notice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starkpay-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError('');
    setKeyTxHash('');
    try {
      const result = await setKey(viewingKey);
      setKeyTxHash(result.transaction_hash);
      setViewingKey('');
    } catch (e: unknown) {
      setKeyError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="mb-1 text-sm font-semibold text-text-primary">Compliance</h2>
      <p className="mb-4 text-xs text-text-secondary">
        {total} payment record{total !== 1 ? 's' : ''} on-chain
      </p>

      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={total === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface py-2.5 text-sm font-medium text-text-secondary transition hover:border-accent/40 hover:text-text-primary disabled:opacity-40"
        >
          <Download size={14} />
          Export Payment Records
        </button>

        <form onSubmit={handleSetKey} className="flex gap-2">
          <input
            placeholder="Viewing key (felt252 hex)"
            value={viewingKey}
            onChange={(e) => setViewingKey(e.target.value)}
            className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={settingKey || !viewingKey}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface px-3 py-2 text-xs text-text-secondary transition hover:border-accent/40 hover:text-text-primary disabled:opacity-50"
          >
            {settingKey ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
            Set Key
          </button>
        </form>
      </div>

      {keyTxHash && <p className="mt-3 truncate text-xs text-success">Tx: {keyTxHash}</p>}
      {keyError && <p className="mt-3 text-xs text-danger">{keyError}</p>}
    </div>
  );
}
