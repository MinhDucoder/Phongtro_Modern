import ChatLayout from '@/components/chat/ChatLayout';
import ChatTestButton from '@/components/chat/ChatTestButton';
import { AuthRequired } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface ChatPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  return (
    <AuthRequired>
      <ChatContent searchParams={searchParams} />
    </AuthRequired>
  );
}

async function ChatContent({ searchParams }: ChatPageProps) {

  // Only show test panel when debug=true in URL
  const params = await searchParams;
  const showDebugPanel = params.debug === 'true';

  return (
    <div className="chat-page">
      {/* Debug Panel - Only show when ?debug=true */}
      {showDebugPanel && (
        <div className="bg-yellow-50 border-b-2 border-yellow-300 p-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-yellow-900 flex items-center">
                🔧 Development Test Panel
              </h2>
              <Link 
                href="/chat" 
                className="text-sm text-yellow-800 hover:text-yellow-900 underline font-medium bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded-full transition-colors"
              >
                ✕ Ẩn Debug Panel
              </Link>
            </div>
            <ChatTestButton />
          </div>
        </div>
      )}
      
      {/* Main Chat Layout */}
      <ChatLayout />
    </div>
  );
}

export const metadata = {
  title: 'Tin nhắn | NhaTroVN',
  description: 'Trò chuyện trực tiếp với chủ nhà và người thuê phòng.',
};
