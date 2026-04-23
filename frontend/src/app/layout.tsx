import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers/StarknetProvider';

export const metadata: Metadata = {
  title: 'StarkPay',
  description: 'Private on-chain payroll for Web3 teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
