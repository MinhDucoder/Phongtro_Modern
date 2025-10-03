'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  HeartIcon,
  DocumentTextIcon,
  CogIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface ChatUserShellProps {
  children: React.ReactNode;
}

const profileNav = [
  { id: 'chat', name: 'Tin nhắn', href: '/chat-user', icon: ChatBubbleLeftRightIcon },
  { id: 'profile', name: 'Thông tin cá nhân', href: '/profile', icon: UserIcon },
  { id: 'saved', name: 'Tin đã lưu', href: '/profile?tab=saved', icon: HeartIcon },
  { id: 'requests', name: 'Yêu cầu thuê', href: '/profile?tab=requests', icon: DocumentTextIcon },
  { id: 'settings', name: 'Cài đặt', href: '/profile?tab=settings', icon: CogIcon },
  { id: 'security', name: 'Bảo mật', href: '/profile?tab=security', icon: KeyIcon },
];

export default function ChatUserShell({ children }: ChatUserShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={typeof user.avatar === 'string' ? user.avatar : (user.avatar as any)?.url}
                        alt={user?.full_name || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.full_name || user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {profileNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <section className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow border">
              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}





