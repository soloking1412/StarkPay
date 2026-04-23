'use client';

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';

export function useWalletStatus() {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address,
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
    isDisconnected: status === 'disconnected',
    connect,
    connectors,
    disconnect,
  };
}
