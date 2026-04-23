'use client';

import { WalletBar } from '@/components/WalletBar';
import { PendingBalance } from '@/components/contributor/PendingBalance';
import { ClaimPanel } from '@/components/contributor/ClaimPanel';
import { useWalletStatus } from '@/hooks/useWalletStatus';
import { useIsContributor } from '@/hooks/usePayrollVault';
import { ShieldOff, Loader2 } from 'lucide-react';

export default function ContributorPage() {
  const { address, isConnected, isConnecting, isDisconnected } = useWalletStatus();
  const { data: isMember } = useIsContributor(address);

  return (
    <>
      <WalletBar />
      <main className="flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="w-full max-w-sm">
          {isConnecting ? (
            <div className="rounded-xl border border-surface-border bg-surface-raised p-8 text-center">
              <Loader2 size={24} className="mx-auto mb-3 animate-spin text-accent" />
              <p className="text-sm text-text-secondary">Connecting wallet…</p>
            </div>
          ) : isDisconnected ? (
            <div className="rounded-xl border border-surface-border bg-surface-raised p-8 text-center">
              <ShieldOff size={28} className="mx-auto mb-3 text-text-muted" />
              <p className="text-sm font-medium text-text-secondary">Connect your wallet to view your balance</p>
            </div>
          ) : isMember === false ? (
            <div className="rounded-xl border border-surface-border bg-surface-raised p-8 text-center">
              <ShieldOff size={28} className="mx-auto mb-3 text-text-muted" />
              <p className="text-sm font-medium text-text-secondary">This address is not registered as a contributor</p>
              <p className="mt-2 text-xs text-text-muted">Ask your employer to add your wallet address</p>
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <PendingBalance />
              <ClaimPanel />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
