'use client';

import Header from './Header';
import SearchSection from './SearchSection';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <Header />
      <SearchSection />
      <main>
        {children}
      </main>
    </>
  );
}
