import ChatLayout from '@/components/chat/ChatLayout';
import ChatUserShell from '@/components/chat/ChatUserShell';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatUserConversationPage({ params }: PageProps) {
  const { conversationId } = await params;

  return (
    <AuthRequired>
      <ChatUserShell>
        <ChatLayout activeConversationId={conversationId} />
      </ChatUserShell>
    </AuthRequired>
  );
}

export const metadata = {
  title: 'Trò chuyện | NhaTroVN',
  description: 'Trò chuyện trực tiếp với chủ nhà và người thuê phòng.',
};


