'use client';

import { useReadContract, useSendTransaction } from '@starknet-react/core';
import { CallData, cairo } from 'starknet';
import { VAULT_ABI, ERC20_ABI } from '@/lib/abi';
import { VAULT_ADDRESS, USDC_ADDRESS } from '@/lib/constants';

export function useVaultBalance() {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_vault_balance',
    args: [],
    refetchInterval: 6000,
  });
}

export function useContributorCount() {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_contributor_count',
    args: [],
    refetchInterval: 6000,
  });
}

export function useContributorAt(index: number) {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_contributor_at',
    args: [index],
  });
}

export function useContributorInfo(address: string | undefined) {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_contributor',
    args: address ? [address] : undefined,
    enabled: !!address,
    refetchInterval: 6000,
  });
}

export function usePendingBalance(address: string | undefined) {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_pending',
    args: address ? [address] : undefined,
    enabled: !!address,
    refetchInterval: 6000,
  });
}

export function useIsContributor(address: string | undefined) {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'is_contributor',
    args: address ? [address] : undefined,
    enabled: !!address,
    refetchInterval: 6000,
  });
}

export function usePaymentCount() {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_payment_count',
    args: [],
    refetchInterval: 6000,
  });
}

export function useEmployer() {
  return useReadContract({
    abi: VAULT_ABI,
    address: VAULT_ADDRESS,
    functionName: 'get_employer',
    args: [],
  });
}

export function useUsdcBalance(address: string | undefined) {
  return useReadContract({
    abi: ERC20_ABI,
    address: USDC_ADDRESS,
    functionName: 'balance_of',
    args: address ? [address] : undefined,
    enabled: !!address,
    refetchInterval: 6000,
  });
}

export function useDeposit() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async (amount: bigint) => {
    return sendAsync([
      {
        contractAddress: USDC_ADDRESS,
        entrypoint: 'approve',
        calldata: CallData.compile({ spender: VAULT_ADDRESS, amount: cairo.uint256(amount) }),
      },
      {
        contractAddress: VAULT_ADDRESS,
        entrypoint: 'deposit',
        calldata: CallData.compile({ amount: cairo.uint256(amount) }),
      },
    ]);
  };
  return { execute, isPending };
}

export function useAddContributor() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async (address: string, salary: bigint, interval: bigint) => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'add_contributor',
      calldata: CallData.compile({
        address,
        salary: cairo.uint256(salary),
        interval: interval.toString(),
      }),
    }]);
  };
  return { execute, isPending };
}

export function useRemoveContributor() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async (address: string) => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'remove_contributor',
      calldata: CallData.compile({ address }),
    }]);
  };
  return { execute, isPending };
}

export function useUpdateSalary() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async (address: string, newSalary: bigint) => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'update_salary',
      calldata: CallData.compile({ address, new_salary: cairo.uint256(newSalary) }),
    }]);
  };
  return { execute, isPending };
}

export function useProcessAllDue() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async () => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'process_all_due',
      calldata: [],
    }]);
  };
  return { execute, isPending };
}

export function useClaim() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async () => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'claim',
      calldata: [],
    }]);
  };
  return { execute, isPending };
}

export function useWithdrawExcess() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async (amount: bigint) => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'withdraw_excess',
      calldata: CallData.compile({ amount: cairo.uint256(amount) }),
    }]);
  };
  return { execute, isPending };
}

export function useSetViewingKey() {
  const { sendAsync, isPending } = useSendTransaction({});
  const execute = async (key: string) => {
    return sendAsync([{
      contractAddress: VAULT_ADDRESS,
      entrypoint: 'set_viewing_key',
      calldata: CallData.compile({ key }),
    }]);
  };
  return { execute, isPending };
}
