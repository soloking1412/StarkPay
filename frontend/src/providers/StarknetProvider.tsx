'use client';

import {
  StarknetConfig,
  jsonRpcProvider,
  voyager,
  argent,
  braavos,
  useInjectedConnectors,
} from '@starknet-react/core';
import { sepolia } from '@starknet-react/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 10_000 } },
});

function rpc() {
  return { nodeUrl: process.env.NEXT_PUBLIC_RPC_URL! };
}

function StarknetDynamicProvider({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always',
    order: 'alphabetical',
  });

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={jsonRpcProvider({ rpc })}
      explorer={voyager}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetDynamicProvider>{children}</StarknetDynamicProvider>
    </QueryClientProvider>
  );
}
