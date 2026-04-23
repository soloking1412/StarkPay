export const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? '0x0') as `0x${string}`;
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '0x0') as `0x${string}`;

// All addresses that should be routed to the employer dashboard
export const EMPLOYER_ADDRESSES: bigint[] = [
  BigInt('0x04daf6719aa2fb44ffb25e64ff6565d6d93009befcc03caa17e7047df0e9a9fd'),
  BigInt('0x05ed07895f20905fd3277b617c08edec20b317a636e4166ff69f0c37d6125693'),
  BigInt('0x06a8c33470d20f18c268306730e18e59055447424a6f6d0a895b7aa0e2da014d'),
];

export const WEEKLY = 604800n;
export const BIWEEKLY = 1209600n;
export const MONTHLY = 2592000n;

export const INTERVAL_LABELS: Record<string, string> = {
  [WEEKLY.toString()]: 'Weekly',
  [BIWEEKLY.toString()]: 'Bi-Weekly',
  [MONTHLY.toString()]: 'Monthly',
};

export const USDC_DECIMALS = 6;
