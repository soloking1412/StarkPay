'use client';

import { WalletBar } from '@/components/WalletBar';
import { VaultBalance } from '@/components/employer/VaultBalance';
import { DepositForm } from '@/components/employer/DepositForm';
import { ContributorForm } from '@/components/employer/ContributorForm';
import { ContributorTable } from '@/components/employer/ContributorTable';
import { DisbursementPanel } from '@/components/employer/DisbursementPanel';
import { CompliancePanel } from '@/components/employer/CompliancePanel';
import { useWalletStatus } from '@/hooks/useWalletStatus';
import { Wallet, Loader2 } from 'lucide-react';

export default function EmployerPage() {
  const { isConnected, isConnecting } = useWalletStatus();

  if (isConnecting) {
    return (
      <>
        <WalletBar />
        <main className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <Loader2 size={16} className="animate-spin text-accent" />
            Connecting wallet…
          </div>
        </main>
      </>
    );
  }

  if (!isConnected) {
    return (
      <>
        <WalletBar />
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-xl border border-surface-border bg-surface-raised p-8 text-center">
            <Wallet size={28} className="mx-auto mb-3 text-text-muted" />
            <p className="text-sm font-medium text-text-secondary">
              Connect your wallet to access the Payroll Dashboard
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <WalletBar />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Payroll Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage contributors and disburse salaries privately</p>
        </div>

        <div className="space-y-6">
          <VaultBalance />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DepositForm />
            <ContributorForm />
          </div>

          <ContributorTable />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DisbursementPanel />
            <CompliancePanel />
          </div>
        </div>
      </main>
    </>
  );
}
