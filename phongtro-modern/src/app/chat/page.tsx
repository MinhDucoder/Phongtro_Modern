import { redirect } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';

// Mock auth check - trong thực tế sẽ check từ session/JWT
const isAuthenticated = true;

export default function ChatPage() {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  return <ChatLayout />;
}

export const metadata = {
  title: 'Tin nhắn | NhaTroVN',
  description: 'Trò chuyện trực tiếp với chủ nhà và người thuê phòng.',
};
