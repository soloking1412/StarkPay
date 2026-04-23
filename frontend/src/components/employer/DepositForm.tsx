'use client';

import { useState } from 'react';
import { useDeposit, useWithdrawExcess } from '@/hooks/usePayrollVault';
import { parseUsdc } from '@/lib/format';
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';

export function DepositForm() {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const { execute: deposit, isPending: depositing } = useDeposit();
  const { execute: withdraw, isPending: withdrawing } = useWithdrawExcess();

  const handleDeposit = async () => {
    setError('');
    try {
      const amount = parseUsdc(depositAmount);
      if (amount <= 0n) return;
      const result = await deposit(amount);
      setTxHash(result.transaction_hash);
      setDepositAmount('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  const handleWithdraw = async () => {
    setError('');
    try {
      const amount = parseUsdc(withdrawAmount);
      if (amount <= 0n) return;
      const result = await withdraw(amount);
      setTxHash(result.transaction_hash);
      setWithdrawAmount('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="mb-4 text-sm font-semibold text-text-primary">Vault Funds</h2>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount (USDC)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleDeposit}
            disabled={depositing || !depositAmount}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {depositing ? <Loader2 size={13} className="animate-spin" /> : <ArrowDownToLine size={13} />}
            Deposit
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount (USDC)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !withdrawAmount}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            {withdrawing ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpFromLine size={13} />}
            Withdraw
          </button>
        </div>
      </div>

      {txHash && (
        <p className="mt-3 truncate text-xs text-success">
          Tx: {txHash}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
