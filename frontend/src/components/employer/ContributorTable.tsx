'use client';

import { useEffect, useState } from 'react';
import {
  useContributorCount,
  useContributorAt,
  useContributorInfo,
  useRemoveContributor,
  useUpdateSalary,
} from '@/hooks/usePayrollVault';
import { formatUsdc, intervalLabel, shortAddress, parseUsdc } from '@/lib/format';
import { ContributorInfo } from '@/lib/types';
import { Trash2, Pencil, Check, X, Loader2 } from 'lucide-react';

function ContributorRow({ index }: { index: number }) {
  const { data: address } = useContributorAt(index);
  const { data: info } = useContributorInfo(address as string | undefined);
  const { execute: remove, isPending: removing } = useRemoveContributor();
  const { execute: updateSalary, isPending: updating } = useUpdateSalary();
  const [editing, setEditing] = useState(false);
  const [newSalary, setNewSalary] = useState('');

  if (!address || !info) return null;
  const contrib = info as unknown as ContributorInfo;
  if (!contrib.active) return null;

  const handleRemove = () => remove(address as string);
  const handleSave = async () => {
    await updateSalary(address as string, parseUsdc(newSalary));
    setEditing(false);
  };

  return (
    <tr className="border-t border-surface-border">
      <td className="py-3 pr-4 font-mono text-xs text-text-secondary">{shortAddress(address as string)}</td>
      <td className="py-3 pr-4 text-sm text-text-primary">
        {editing ? (
          <input
            autoFocus
            type="number"
            value={newSalary}
            onChange={(e) => setNewSalary(e.target.value)}
            className="w-24 rounded border border-accent bg-surface px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          `$${formatUsdc(BigInt(contrib.salary.toString()))}`
        )}
      </td>
      <td className="py-3 pr-4 text-xs text-text-secondary">{intervalLabel(BigInt(contrib.interval.toString()))}</td>
      <td className="py-3 pr-4">
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          Active
        </span>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={updating} className="p-1 text-success hover:opacity-70">
                {updating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
              <button onClick={() => setEditing(false)} className="p-1 text-text-muted hover:text-text-secondary">
                <X size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setNewSalary(formatUsdc(BigInt(contrib.salary.toString()))); setEditing(true); }}
                className="p-1 text-text-muted transition hover:text-text-secondary"
              >
                <Pencil size={13} />
              </button>
              <button onClick={handleRemove} disabled={removing} className="p-1 text-text-muted transition hover:text-danger">
                {removing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ContributorTable() {
  const { data: count } = useContributorCount();
  const total = count !== undefined ? Number(count) : 0;

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="mb-4 text-sm font-semibold text-text-primary">Contributors</h2>
      {total === 0 ? (
        <p className="py-6 text-center text-xs text-text-muted">No contributors yet</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              {['Address', 'Salary', 'Schedule', 'Status', ''].map((h) => (
                <th key={h} className="pb-2 pr-4 text-left text-xs font-medium text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: total }, (_, i) => (
              <ContributorRow key={i} index={i} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
