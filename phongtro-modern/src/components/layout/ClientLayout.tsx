'use client';

import Header from './Header';
import SearchSection from './SearchSection';
import Footer from './Footer';

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
      <Footer />
    </>
  );
}
