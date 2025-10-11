'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RoleBadge from '@/components/ui/RoleBadge';
import { 
  UserIcon, 
  HeartIcon, 
  DocumentTextIcon, 
  CogIcon, 
  KeyIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ProfileShellProps {
  children: React.ReactNode;
}

const items = [
  { id: 'chat', name: 'Tin nhắn', icon: ChatBubbleLeftRightIcon },
  { id: 'profile', name: 'Thông tin cá nhân', icon: UserIcon },
  { id: 'saved', name: 'Tin đã lưu', icon: HeartIcon },
  { id: 'requests', name: 'Yêu cầu thuê', icon: DocumentTextIcon },
  { id: 'notifications', name: 'Thông báo', icon: BellIcon },
  { id: 'settings', name: 'Cài đặt', icon: CogIcon },
  { id: 'security', name: 'Bảo mật', icon: KeyIcon },
];

export default function ProfileShell({ children }: ProfileShellProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const active = params.get('tab') || 'profile';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setTab = (tab: string) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set('tab', tab);
    router.push(pathname + '?' + current.toString());
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center shadow-md">
              {user?.avatar ? (
                <img
                  src={typeof user.avatar === 'string' ? user.avatar : (user.avatar as any)?.url}
                  alt={user?.full_name || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-sm">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.full_name || user?.email}</p>
              {user?.role && <RoleBadge role={user.role} size="sm" />}
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="overflow-x-auto no-scrollbar border-t bg-gray-50">
          <div className="flex px-2 py-2 min-w-max gap-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  active === item.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen lg:h-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r shadow-sm sticky top-0 min-h-screen">
          {/* Sidebar Header */}
          <div className="p-6 bg-blue-600 border-b border-blue-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center shadow-lg">
                {user?.avatar ? (
                  <img
                    src={typeof user.avatar === 'string' ? user.avatar : (user.avatar as any)?.url}
                    alt={user?.full_name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-2xl text-white">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white truncate">{user?.full_name || user?.email}</p>
                <p className="text-xs text-blue-100 truncate">{user?.email}</p>
                {user?.role && (
                  <div className="mt-2">
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active === item.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {active === item.id && (
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p>Phòng trô Modern</p>
              <p className="mt-1">© 2025 All rights reserved</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


