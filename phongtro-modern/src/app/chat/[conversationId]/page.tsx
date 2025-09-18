import { redirect } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

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

  return (
    <DashboardLayout>
      <ChatLayout activeConversationId={conversationId} />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Trò chuyện | NhaTroVN',
  description: 'Trò chuyện trực tiếp với chủ nhà và người thuê phòng.',
};
