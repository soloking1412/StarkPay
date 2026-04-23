export interface ContributorInfo {
  salary: bigint;
  interval: bigint;
  last_payment: bigint;
  pending: bigint;
  active: boolean;
}

export interface PaymentRecord {
  contributor: string;
  amount: bigint;
  timestamp: bigint;
  record_id: number;
}

export interface ContributorRow {
  address: string;
  info: ContributorInfo;
}
