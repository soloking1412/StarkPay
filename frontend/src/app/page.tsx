'use client';

import { useRouter } from 'next/navigation';
import { WalletBar } from '@/components/WalletBar';
import { useWalletStatus } from '@/hooks/useWalletStatus';
import { EMPLOYER_ADDRESSES } from '@/lib/constants';
import { ArrowRight, Lock, FileText, Users } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { address, isConnected } = useWalletStatus();

  const handleLaunch = () => {
    if (!isConnected || !address) return;
    const isEmployer = EMPLOYER_ADDRESSES.includes(BigInt(address));
    router.push(isEmployer ? '/employer' : '/contributor');
  };

  return (
    <>
      <WalletBar />
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-4 py-1.5 text-xs font-medium text-accent">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live on Starknet Sepolia
          </div>

          <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight text-text-primary">
            Payroll that stays
            <br />
            <span className="text-accent">private by default</span>
          </h1>

          <p className="mb-10 text-lg leading-relaxed text-text-secondary">
            Pay contributors in USDC without exposing salaries, wallet addresses,
            or treasury flows on a public block explorer.
          </p>

          <div className="mb-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isConnected ? (
              <button
                onClick={handleLaunch}
                className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                <ArrowRight size={16} />
                Launch Dashboard
              </button>
            ) : (
              <p className="text-sm text-text-muted">Connect your wallet to get started</p>
            )}
            <a
              href="/contributor"
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-raised px-7 py-3.5 text-sm font-semibold text-text-secondary transition hover:border-accent/40 hover:text-text-primary"
            >
              I&apos;m a Contributor
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Lock,
                title: 'Shielded Disbursements',
                desc: 'Salary amounts and recipient addresses stay off public explorers',
              },
              {
                icon: Users,
                title: 'Contributor Registry',
                desc: 'Manage recurring payroll with weekly, bi-weekly, or monthly schedules',
              },
              {
                icon: FileText,
                title: 'Compliance Export',
                desc: 'Employer viewing key unlocks a full audit trail for tax reporting',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-surface-border bg-surface-raised p-5 text-left"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
                  <Icon size={16} className="text-accent" />
                </div>
                <p className="mb-1.5 text-sm font-semibold text-text-primary">{title}</p>
                <p className="text-xs leading-relaxed text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
