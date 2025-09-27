'use client';

import Header from './Header';
import { Toaster } from 'react-hot-toast';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
    </>
  );
}
