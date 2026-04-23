'use client';

import { useState } from 'react';
import { useClaim, usePendingBalance } from '@/hooks/usePayrollVault';
import { useWalletStatus } from '@/hooks/useWalletStatus';
import { ArrowDownToLine, Loader2, CheckCircle } from 'lucide-react';

export function ClaimPanel() {
  const { address } = useWalletStatus();
  const { data: pending } = usePendingBalance(address);
  const { execute, isPending } = useClaim();
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const hasPending = pending !== undefined && BigInt(pending.toString()) > 0n;

  const handleClaim = async () => {
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
    <div className="rounded-xl border border-surface-border bg-surface-raised p-6">
      <h2 className="mb-1 text-sm font-semibold text-text-primary">Claim Payment</h2>
      <p className="mb-5 text-xs text-text-secondary">
        Transfer your accrued salary to your wallet.
      </p>

      <button
        onClick={handleClaim}
        disabled={isPending || !hasPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? (
          <><Loader2 size={15} className="animate-spin" /> Processing…</>
        ) : (
          <><ArrowDownToLine size={15} /> Claim Salary</>
        )}
      </button>

      {!hasPending && !txHash && (
        <p className="mt-3 text-center text-xs text-text-muted">
          No balance to claim yet
        </p>
      )}

      {txHash && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-success/10 p-3">
          <CheckCircle size={14} className="mt-0.5 shrink-0 text-success" />
          <div>
            <p className="text-xs font-medium text-success">Payment claimed</p>
            <p className="mt-0.5 break-all font-mono text-xs text-text-secondary">{txHash}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
