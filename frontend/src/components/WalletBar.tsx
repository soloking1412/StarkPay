'use client';

import { useState, useEffect, useRef } from 'react';
import { useConnect, useDisconnect, useAccount } from '@starknet-react/core';
import { shortAddress } from '@/lib/format';
import { Wallet, LogOut, ChevronDown, Loader2, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';

export function WalletBar() {
  const { address, status } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [showConnectors, setShowConnectors] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting';

  const cancelConnect = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConnecting(false);
    setError('');
  };

  const handleConnect = async (connector: typeof connectors[0]) => {
    setShowConnectors(false);
    setError('');
    setConnecting(true);

    // Auto-cancel after 15 s if the wallet never responds
    timeoutRef.current = setTimeout(() => {
      setConnecting(false);
      setError('Wallet did not respond. Try a different wallet or reload the page.');
    }, 15000);

    try {
      await connectAsync({ connector });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes('chain') || msg.toLowerCase().includes('network')) {
        setError('Switch your wallet to Starknet Sepolia and try again.');
      } else if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('cancel')) {
        setError('Connection cancelled.');
      } else {
        setError('Connection failed. Make sure your wallet is on Starknet Sepolia.');
      }
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setConnecting(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">StarkPay</span>
        </a>

        <div className="flex flex-col items-end gap-1">
          <div className="relative">
            {!mounted || isReconnecting ? (
              <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-raised" />
            ) : isConnected && address ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="font-mono text-xs text-text-secondary">{shortAddress(address)}</span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-xs text-text-secondary transition hover:border-danger/40 hover:text-danger"
                >
                  <LogOut size={12} />
                  Disconnect
                </button>
              </div>
            ) : connecting ? (
              <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-4 py-2 text-sm text-text-muted">
                <Loader2 size={13} className="animate-spin" />
                Approve in wallet…
                <button
                  onClick={cancelConnect}
                  className="ml-1 rounded p-0.5 transition hover:text-danger"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => { setError(''); setShowConnectors(!showConnectors); }}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
                >
                  <Wallet size={14} />
                  Connect Wallet
                  <ChevronDown size={12} className={clsx('transition', showConnectors && 'rotate-180')} />
                </button>

                {showConnectors && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowConnectors(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-xl">
                      <p className="border-b border-surface-border px-4 py-2 text-xs text-text-muted">
                        Set wallet to <span className="font-medium text-accent">Starknet Sepolia</span> first
                      </p>
                      {connectors.length === 0 ? (
                        <div className="px-4 py-4 text-center">
                          <p className="text-xs text-text-muted">No wallets detected.</p>
                          <p className="mt-1 text-xs text-text-muted">Install Argent X, Braavos, or ReadyX.</p>
                        </div>
                      ) : (
                        connectors.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleConnect(c)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text-primary transition hover:bg-surface-border"
                          >
                            {c.icon && typeof c.icon === 'object' && c.icon.light && (
                              <img src={c.icon.light} alt="" className="h-5 w-5 rounded" />
                            )}
                            {c.icon && typeof c.icon === 'string' && (
                              <img src={c.icon} alt="" className="h-5 w-5 rounded" />
                            )}
                            <span>{c.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-danger">
              <AlertCircle size={11} />
              {error}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
