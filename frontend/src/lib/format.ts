import { USDC_DECIMALS, INTERVAL_LABELS } from './constants';

export function formatUsdc(raw: bigint): string {
  const divisor = 10n ** BigInt(USDC_DECIMALS);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(USDC_DECIMALS, '0').replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

export function parseUsdc(value: string): bigint {
  const [whole = '0', frac = ''] = value.split('.');
  const fracPadded = frac.slice(0, USDC_DECIMALS).padEnd(USDC_DECIMALS, '0');
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(fracPadded);
}

export function shortAddress(addr: string | bigint): string {
  const str = typeof addr === 'bigint' ? `0x${addr.toString(16)}` : addr;
  if (str.length < 10) return str;
  return `${str.slice(0, 6)}…${str.slice(-4)}`;
}

export function intervalLabel(seconds: bigint): string {
  return INTERVAL_LABELS[seconds.toString()] ?? `${seconds}s`;
}

export function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
