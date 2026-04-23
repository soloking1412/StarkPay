'use client';

import { useState } from 'react';
import { useProcessAllDue } from '@/hooks/usePayrollVault';
import { PlayCircle, Loader2 } from 'lucide-react';

export function DisbursementPanel() {
  const { execute, isPending } = useProcessAllDue();
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleProcess = async () => {
    setError('');
    setTxHash('');
    try {
      const result = await execute();
      setTxHash(result.transaction_hash);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="mb-1 text-sm font-semibold text-text-primary">Disbursements</h2>
      <p className="mb-4 text-xs text-text-secondary">
        Accrue salaries for all contributors whose payment interval has elapsed.
      </p>

      <button
        onClick={handleProcess}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
        Process All Due Payments
      </button>

      {txHash && <p className="mt-3 truncate text-xs text-success">Tx: {txHash}</p>}
      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </div>
  );
}
