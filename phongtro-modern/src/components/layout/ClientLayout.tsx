'use client';

import Header from './Header';

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
