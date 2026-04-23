'use client';

import { useState } from 'react';
import { useAddContributor } from '@/hooks/usePayrollVault';
import { parseUsdc } from '@/lib/format';
import { WEEKLY, BIWEEKLY, MONTHLY } from '@/lib/constants';
import { UserPlus, Loader2 } from 'lucide-react';

export function ContributorForm() {
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [interval, setInterval] = useState(WEEKLY.toString());
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const { execute, isPending } = useAddContributor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTxHash('');
    try {
      const result = await execute(address, parseUsdc(salary), BigInt(interval));
      setTxHash(result.transaction_hash);
      setAddress('');
      setSalary('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="mb-4 text-sm font-semibold text-text-primary">Add Contributor</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Wallet address (0x…)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
        />

        <div className="flex gap-2">
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Salary (USDC)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
          />
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value={WEEKLY.toString()}>Weekly</option>
            <option value={BIWEEKLY.toString()}>Bi-Weekly</option>
            <option value={MONTHLY.toString()}>Monthly</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          Add Contributor
        </button>
      </form>

      {txHash && <p className="mt-3 truncate text-xs text-success">Tx: {txHash}</p>}
      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </div>
  );
}
