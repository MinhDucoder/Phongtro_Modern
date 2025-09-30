'use client';

import dynamic from 'next/dynamic';

// Dynamically import ConsolidatedSettings to ensure it's treated as Client Component
const ConsolidatedSettings = dynamic(() => import('./ConsolidatedSettings'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="flex gap-6">
        <div className="w-1/4">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
        <div className="w-3/4">
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
});

export default function UserSettingsWrapper() {
  return <ConsolidatedSettings />;
}
