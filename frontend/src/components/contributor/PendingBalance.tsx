'use client';

import { usePendingBalance, useContributorInfo } from '@/hooks/usePayrollVault';
import { useWalletStatus } from '@/hooks/useWalletStatus';
import { formatUsdc, intervalLabel, formatTimestamp } from '@/lib/format';
import { ContributorInfo } from '@/lib/types';
import { Clock } from 'lucide-react';

export function PendingBalance() {
  const { address } = useWalletStatus();
  const { data: pending } = usePendingBalance(address);
  const { data: info } = useContributorInfo(address);

  const contrib = info as unknown as ContributorInfo | undefined;
  const pendingAmount = pending !== undefined ? BigInt(pending.toString()) : 0n;
  const nextPayment = contrib
    ? BigInt(contrib.last_payment.toString()) + BigInt(contrib.interval.toString())
    : null;

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-6">
      <p className="text-xs text-text-secondary">Pending Balance</p>
      <p className="mt-2 text-4xl font-bold tabular-nums text-text-primary">
        ${formatUsdc(pendingAmount)}
      </p>
      <p className="mt-1 text-xs text-text-muted">USDC available to claim</p>

      {contrib && (
        <div className="mt-5 space-y-2 border-t border-surface-border pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Salary</span>
            <span className="font-medium text-text-secondary">
              ${formatUsdc(BigInt(contrib.salary.toString()))} / {intervalLabel(BigInt(contrib.interval.toString()))}
            </span>
          </div>
          {nextPayment && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Next accrual</span>
              <span className="flex items-center gap-1 text-text-secondary">
                <Clock size={11} />
                {formatTimestamp(nextPayment)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
