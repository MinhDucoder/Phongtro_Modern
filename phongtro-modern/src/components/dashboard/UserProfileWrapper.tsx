'use client';

import dynamic from 'next/dynamic';

// Dynamically import ProfileOverview to ensure it's treated as Client Component
const ProfileOverview = dynamic(() => import('./ProfileOverview'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="bg-gray-200 h-32 rounded-lg"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-200 h-20 rounded-lg"></div>
        <div className="bg-gray-200 h-20 rounded-lg"></div>
        <div className="bg-gray-200 h-20 rounded-lg"></div>
        <div className="bg-gray-200 h-20 rounded-lg"></div>
      </div>
      <div className="bg-gray-200 h-48 rounded-lg"></div>
    </div>
  )
});

export default function UserProfileWrapper() {
  return <ProfileOverview />;
}
