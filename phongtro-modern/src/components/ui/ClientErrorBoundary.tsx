'use client';

import ErrorBoundary from './ErrorBoundary';

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
