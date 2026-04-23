'use client';

import { useVaultBalance, useContributorCount, useUsdcBalance } from '@/hooks/usePayrollVault';
import { useWalletStatus } from '@/hooks/useWalletStatus';
import { formatUsdc } from '@/lib/format';
import { Vault, Users, Wallet } from 'lucide-react';

export function VaultBalance() {
  const { data: vaultBalance } = useVaultBalance();
  const { data: count } = useContributorCount();
  const { address } = useWalletStatus();
  const { data: walletBalance } = useUsdcBalance(address);

  const stats = [
    {
      icon: Vault,
      label: 'Vault Balance',
      value: vaultBalance !== undefined ? `$${formatUsdc(BigInt(vaultBalance.toString()))}` : '—',
      sub: 'USDC locked',
    },
    {
      icon: Users,
      label: 'Contributors',
      value: count !== undefined ? count.toString() : '—',
      sub: 'active',
    },
    {
      icon: Wallet,
      label: 'Wallet Balance',
      value: walletBalance !== undefined ? `$${formatUsdc(BigInt(walletBalance.toString()))}` : '—',
      sub: 'USDC available',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ icon: Icon, label, value, sub }) => (
        <div key={label} className="rounded-xl border border-surface-border bg-surface-raised p-5">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted">
            <Icon size={14} className="text-accent" />
          </div>
          <p className="text-xs text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
          <p className="mt-0.5 text-xs text-text-muted">{sub}</p>
        </div>
      ))}
    </div>
  );
}
