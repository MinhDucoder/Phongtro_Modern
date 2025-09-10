import { redirect } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';

// Mock auth check
const isAuthenticated = true;

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  const { conversationId } = await params;

  return <ChatLayout activeConversationId={conversationId} />;
}

export const metadata = {
  title: 'Trò chuyện | Phongtro123.com',
  description: 'Trò chuyện trực tiếp với chủ nhà và người thuê phòng.',
};
