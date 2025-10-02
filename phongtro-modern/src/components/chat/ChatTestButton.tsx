'use client';

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/ui/Button';
import { toastManager } from '@/components/ui/ToastManager';

export default function ChatTestButton() {
  const { user } = useAuth();
  const { socket, isConnected, connectionError } = useSocket();
  const { conversations, openConversation, sendMessage, loadConversations } = useChat();
  const [isTesting, setIsTesting] = useState(false);
  const [otherUserId, setOtherUserId] = useState('');
  const [testMessage, setTestMessage] = useState('');

  const handleOpenConversation = async () => {
    if (!user) {
      toastManager.showError('Vui lòng đăng nhập để test chat');
      return;
    }

    if (!isConnected) {
      toastManager.showError('Socket chưa kết nối');
      return;
    }

    if (!otherUserId.trim()) {
      toastManager.showError('Vui lòng nhập User ID của người khác');
      return;
    }

    setIsTesting(true);
    try {
      await openConversation(otherUserId.trim());
      toastManager.showSuccess('Đã mở cuộc trò chuyện thành công!');
    } catch (error) {
      console.error('Open conversation failed:', error);
      toastManager.showError('Mở cuộc trò chuyện thất bại');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) {
      toastManager.showError('Vui lòng nhập tin nhắn');
      return;
    }

    if (!conversations.length) {
      toastManager.showError('Chưa có cuộc trò chuyện nào');
      return;
    }

    // Find conversation that contains the otherUserId we used to create it
    let targetConversation = conversations.find(conv => 
      conv.participants.some(p => p._id === otherUserId.trim())
    );

    // If not found, use the first conversation
    if (!targetConversation) {
      targetConversation = conversations[0];
    }

    // Find partner in the target conversation
    const partner = targetConversation.participants.find(p => p._id !== user?._id);
    
    console.log('Debug conversation search:', {
      allConversations: conversations.map(c => ({
        id: c._id,
        participants: c.participants.map(p => p._id)
      })),
      otherUserId: otherUserId.trim(),
      targetConversation: targetConversation ? {
        id: targetConversation._id,
        participants: targetConversation.participants.map(p => p._id)
      } : null,
      partner: partner,
      user: user?._id
    });
    
    if (!partner) {
      toastManager.showError('Không tìm thấy người nhận trong conversation');
      return;
    }

    if (!partner._id) {
      toastManager.showError('Partner ID không hợp lệ');
      return;
    }

    if (!targetConversation._id) {
      toastManager.showError('Conversation ID không hợp lệ');
      return;
    }

    console.log('Debug info:', {
      conversationId: targetConversation._id,
      receiverId: partner._id,
      message: testMessage,
      partner: partner,
      conversation: targetConversation
    });

    try {
      await sendMessage(testMessage, targetConversation._id, partner._id);
      setTestMessage('');
      // Note: Success toast will be shown by the socket response handler
    } catch (error) {
      console.error('Send message failed:', error);
      toastManager.showError('Gửi tin nhắn thất bại');
    }
  };


  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Vui lòng đăng nhập để test chat</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded-lg space-y-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Chat Test Panel</h3>
      
      {/* Connection Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">Socket Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {connectionError && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Error:</strong> {connectionError}
          </div>
        )}
        
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">User ID:</span>
              <span className="text-xs font-mono text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {user._id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Conversations:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-800 bg-gray-200 px-2 py-1 rounded">
                  {conversations.length}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await loadConversations();
                      toastManager.showSuccess('Đã tải lại danh sách conversations');
                    } catch (error) {
                      toastManager.showError('Lỗi tải conversations');
                    }
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            {conversations.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-medium text-blue-800">First Conversation ID:</span>
                    <span className="ml-1 font-mono text-blue-700">
                      {conversations[0]._id}
                    </span>
                  </div>
                  {(() => {
                    const partner = conversations[0].participants.find(p => p._id !== user._id);
                    return partner && (
                      <div>
                        <span className="font-medium text-blue-800">Partner ID:</span>
                        <span className="ml-1 font-mono text-blue-700">
                          {partner._id}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID của người khác:
          </label>
          <input
            type="text"
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
            placeholder="Nhập User ID để tạo cuộc trò chuyện..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <Button
          onClick={handleOpenConversation}
          disabled={!isConnected || isTesting || !otherUserId.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isTesting ? 'Đang tạo...' : 'Tạo Cuộc Trò Chuyện'}
        </Button>
      </div>

      {/* Test Message */}
      {conversations.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn test:
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Nhập tin nhắn để gửi..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={handleSendTestMessage}
              disabled={!testMessage.trim()}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Gửi Tin Nhắn Test
            </Button>
            
            <Button
              onClick={async () => {
                if (!testMessage.trim()) {
                  toastManager.showError('Vui lòng nhập tin nhắn');
                  return;
                }
                if (!otherUserId.trim()) {
                  toastManager.showError('Vui lòng nhập User ID');
                  return;
                }
                
                try {
                  // Send message directly to the User ID
                  await sendMessage(testMessage, undefined, otherUserId.trim());
                  setTestMessage('');
                  toastManager.showSuccess('Đã gửi tin nhắn trực tiếp!');
                } catch (error) {
                  console.error('Direct send failed:', error);
                  toastManager.showError('Gửi tin nhắn trực tiếp thất bại');
                }
              }}
              disabled={!testMessage.trim() || !otherUserId.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Gửi Trực Tiếp (Không qua Conversation)
            </Button>
          </div>
        </div>
      )}

      {/* Conversations List */}
      {conversations.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Recent Conversations:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {conversations.slice(0, 3).map((conv) => {
              const partner = conv.participants.find(p => p._id !== user._id);
              return (
                <div key={conv._id} className="text-sm p-3 bg-gray-50 rounded-lg border">
                  <p className="font-medium text-gray-800">{partner?.full_name}</p>
                  <p className="text-gray-600 text-xs mt-1">{conv.lastMessage?.text || 'No messages'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
