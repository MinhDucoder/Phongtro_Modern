'use client';

import dynamic from 'next/dynamic';

// Dynamically import UserSettings to ensure it's treated as Client Component
const UserSettings = dynamic(() => import('./UserSettings'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
      <div className="space-y-4">
        <div className="bg-gray-200 h-24 rounded-lg"></div>
        <div className="bg-gray-200 h-24 rounded-lg"></div>
        <div className="bg-gray-200 h-24 rounded-lg"></div>
      </div>
    </div>
  )
});

export default function UserSettingsWrapper() {
  return <UserSettings />;
}
