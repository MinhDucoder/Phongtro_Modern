'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserGroupIcon, PaperAirplaneIcon, PaperClipIcon, CheckIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { chatHelpers, Message, conversationApi } from '@/lib/chatApi';
import { toastManager } from '@/components/ui/ToastManager';

const getAvatar = (avatar: any) => !avatar ? '/placeholder-room.svg' : typeof avatar === 'string' ? avatar.trim() || '/placeholder-room.svg' : avatar.url || '/placeholder-room.svg';
const formatLastTime = (d: string) => { const date = new Date(d); const diff = Math.floor((Date.now() - date.getTime()) / 60000); if (diff < 1) return 'Vừa xong'; if (diff < 60) return `${diff}p`; if (diff < 1440) return `${Math.floor(diff / 60)}h`; if (diff < 10080) return `${Math.floor(diff / 1440)}d`; return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }); };
const formatTime = (d: string) => { if (!d) return '--:--'; const date = new Date(d); return isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); };
const formatDate = (d: string) => { if (!d) return ''; const date = new Date(d); if (isNaN(date.getTime())) return ''; const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1); if (date.toDateString() === today.toDateString()) return 'Hôm nay'; if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua'; return date.toLocaleDateString('vi-VN'); };
const MsgStatus = ({ s }: { s: string }) => s === 'seen' ? <span className="inline-flex items-center gap-0.5 text-blue-400"><CheckIcon className="h-3 w-3" /><CheckIcon className="h-3 w-3 -ml-2" /></span> : (s === 'delivered' || s === 'sent') ? <span className="inline-flex text-blue-200"><CheckIcon className="h-3 w-3" /></span> : null;

export default function ProfileChatLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { conversations, activeConversation, messages, isLoading, setActiveConversation, sendMessage: sendMsg, markMessageSeen, addConversation } = useChat();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversationIdFromUrl = searchParams.get('conversationId');
  const userIdFromUrl = searchParams.get('userId');
  const propertyIdFromUrl = searchParams.get('propertyId');
  const [conversationNotFound, setConversationNotFound] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    let didCancel = false;

    const ensureActiveConversation = async () => {
      // Handle conversationId from URL
      if (conversationIdFromUrl) {
        // If we already have it in list, use it
        if (conversations.length > 0) {
          const conv = conversations.find(c => c._id === conversationIdFromUrl);
          if (conv) {
            if (!didCancel) {
              setActiveConversation(conv);
              setConversationNotFound(false);
            }
            return;
          }
        }

        // If not loading and not found in list, try fetching by ID as fallback
        if (!isLoading) {
          try {
            const res = await conversationApi.getConversationById(conversationIdFromUrl);
            if (!didCancel && res.success && res.data) {
              // Verify current user is a participant before opening
              const isParticipant = res.data.participants?.some(p => p._id === user?._id);
              if (isParticipant) {
                setActiveConversation(res.data);
                setConversationNotFound(false);
            } else {
              setConversationNotFound(true);
            }
          } else if (!didCancel) {
            setConversationNotFound(true);
          }
        } catch (e) {
          if (!didCancel) {
            setConversationNotFound(true);
          }
          }
        }
        return;
      }

      // Handle userId from URL - create conversation with specific user if not found
      if (userIdFromUrl && user?._id && userIdFromUrl !== user._id && !isCreatingConversation) {
        // First check if conversation already exists in the list
        const existingConv = conversations.find(conv => {
          const partner = chatHelpers.getConversationPartner(conv, user._id);
          return partner && partner._id === userIdFromUrl;
        });
        
        if (existingConv) {
          // Conversation exists, set it as active
          if (!didCancel) {
            setActiveConversation(existingConv);
            setConversationNotFound(false);
            // Update URL to include conversationId
            router.push(`/chat?conversationId=${existingConv._id}`, { scroll: false });
          }
        } else if (!isLoading) {
          // Conversation doesn't exist, create new one
          try {
            setIsCreatingConversation(true);
            const res = await conversationApi.createConversation([user._id, userIdFromUrl]);
            if (!didCancel && res.success && (res.data || (res as any).conversation)) {
              const createdConversation = res.data || (res as any).conversation;
              // Fetch populated conversation so participant info (full_name/avatar/role) is available
              let populatedConv = createdConversation;
              try {
                const byId = await conversationApi.getConversationById(createdConversation._id);
                if (byId?.success && byId.data) {
                  populatedConv = byId.data;
                }
              } catch {}
              setActiveConversation(populatedConv);
              setConversationNotFound(false);
              // Add new conversation (populated) to the context
              addConversation(populatedConv);
              // Update URL to include conversationId
              router.push(`/chat?conversationId=${populatedConv._id}`, { scroll: false });
            } else if (!didCancel) {
              setConversationNotFound(true);
            }
          } catch (e) {
            if (!didCancel) {
              setConversationNotFound(true);
            }
          } finally {
            if (!didCancel) {
              setIsCreatingConversation(false);
            }
          }
        }
      }
    };

    ensureActiveConversation();
    return () => { didCancel = true; };
  }, [conversationIdFromUrl, userIdFromUrl, propertyIdFromUrl, isLoading, user?._id, router, addConversation, isCreatingConversation, conversations]);


  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [newMessage]);

  const selectConv = (id: string) => {
    const conv = conversations.find(c => c._id === id);
    if (conv) {
      console.log('🔄 ProfileChatLayout - Switching to conversation:', id);
      
      // Update URL first for immediate feedback
      router.push(`/chat?conversationId=${id}`, { scroll: false });
      
      // Then update active conversation (this will trigger loadMessages in ChatContext)
      setActiveConversation(conv);
      setIsMobileSidebarOpen(false);
    } else {
      console.error('❌ ProfileChatLayout - Conversation not found:', id);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    const p = chatHelpers.getConversationPartner(activeConversation, user?._id || '');
    if (!p) { toastManager.showError('Không tìm thấy người nhận'); return; }
    sendMsg(newMessage, activeConversation._id, p._id);
    setNewMessage('');
  };

  const filteredConvs = conversations.filter(conv => {
    const p = chatHelpers.getConversationPartner(conv, user?._id || '');
    const matchSearch = p?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const unread = chatHelpers.getUnreadCount(conv, user?._id || '');
    const matchFilter = filter === 'all' || (filter === 'unread' && unread > 0);
    return matchSearch && matchFilter;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const totalUnread = conversations.reduce((sum, c) => sum + chatHelpers.getUnreadCount(c, user?._id || ''), 0);

  const groupedMsgs = useMemo(() => {
    return [...messages]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .reduce((g, m) => {
        const d = new Date(m.createdAt).toDateString();
        if (!g[d]) g[d] = [];
        g[d].push(m);
        return g;
      }, {} as Record<string, Message[]>);
  }, [messages]);

  const partner = activeConversation ? chatHelpers.getConversationPartner(activeConversation, user?._id || '') : null;

  if (!user) return <div className="h-[600px] bg-gray-50 flex items-center justify-center rounded-lg"><div className="text-center"><ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Vui lòng đăng nhập</h3><p className="text-gray-500">Bạn cần đăng nhập để sử dụng chat</p></div></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-[600px]">
      <div className="h-full flex">
        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="relative flex w-80 h-full bg-white shadow-xl">
              <div className="absolute top-4 right-4"><button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><XMarkIcon className="h-5 w-5" /></button></div>
              <div className="flex-1 flex flex-col overflow-hidden pt-14">
                <div className="p-4"><h2 className="text-lg font-semibold">Tin nhắn</h2><p className="text-sm text-gray-500">{filteredConvs.length} cuộc trò chuyện</p></div>
                <div className="px-3 pb-3"><input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm" /><div className="flex gap-2 mt-2"><button onClick={() => setFilter('all')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Tất cả</button><button onClick={() => setFilter('unread')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Chưa đọc ({totalUnread})</button></div></div>
                <div className="flex-1 overflow-y-auto">{filteredConvs.map(c => { const p = chatHelpers.getConversationPartner(c, user._id); const u = chatHelpers.getUnreadCount(c, user._id); const sel = activeConversation?._id === c._id; if (!p) return null; return <button key={c._id} onClick={() => selectConv(c._id)} className={`w-full text-left p-3 hover:bg-gray-50 border-b ${sel ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}><div className="flex items-center space-x-3"><Image src={getAvatar(p.avatar)} alt={p.full_name} width={44} height={44} className="rounded-full" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className={`text-sm font-medium truncate ${u > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{p.full_name}</p>{c.lastMessage && <span className="text-xs text-gray-500">{formatLastTime(c.lastMessage.createdAt)}</span>}</div><p className="text-xs text-gray-500">{p.role}</p>{c.lastMessage && <p className={`text-sm truncate ${u > 0 ? 'font-medium text-gray-700' : 'text-gray-500'}`}>{c.lastMessage.sender === user._id ? 'Bạn: ' : ''}{c.lastMessage.text}</p>}</div>{u > 0 && <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">{u > 9 ? '9+' : u}</span>}</div></button>; })}{filteredConvs.length === 0 && <div className="py-12 text-center"><UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">{searchQuery ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}</p></div>}</div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 flex-col border-r bg-white">
          <div className="p-4 border-b"><h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2><p className="text-sm text-gray-500 mt-1">{filteredConvs.length} cuộc trò chuyện</p></div>
          <div className="p-3 space-y-3">
            <div className="relative"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" /></div>
            <div className="flex gap-2"><button onClick={() => setFilter('all')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tất cả ({conversations.length})</button><button onClick={() => setFilter('unread')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Chưa đọc ({totalUnread})</button></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(c => { const p = chatHelpers.getConversationPartner(c, user._id); const u = chatHelpers.getUnreadCount(c, user._id); const sel = activeConversation?._id === c._id; if (!p) return null; return <button key={c._id} onClick={() => selectConv(c._id)} className={`w-full text-left p-3 hover:bg-gray-50 border-b transition ${sel ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}><div className="flex items-center space-x-3"><Image src={getAvatar(p.avatar)} alt={p.full_name} width={44} height={44} className="rounded-full object-cover" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-0.5"><p className={`text-sm font-medium truncate ${u > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{p.full_name}</p>{c.lastMessage && <span className="text-xs text-gray-500 ml-2">{formatLastTime(c.lastMessage.createdAt)}</span>}</div><p className="text-xs text-gray-500 mb-1">{p.role}</p>{c.lastMessage && <p className={`text-sm truncate ${u > 0 ? 'font-medium text-gray-700' : 'text-gray-500'}`}>{c.lastMessage.sender === user._id ? 'Bạn: ' : ''}{c.lastMessage.text}</p>}</div>{u > 0 && <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">{u > 9 ? '9+' : u}</span>}</div></button>; })}
            {filteredConvs.length === 0 && <div className="flex flex-col items-center justify-center py-12 px-4"><UserGroupIcon className="h-12 w-12 text-gray-300 mb-2" /><p className="text-sm text-gray-500 text-center">{searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}</p></div>}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {activeConversation && partner ? (
            <>
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Bars3Icon className="h-5 w-5" /></button>
                  <Image src={getAvatar(partner.avatar)} alt={partner.full_name} width={40} height={40} className="rounded-full" />
                  <div><h3 className="font-semibold text-gray-900">{partner.full_name}</h3><p className="text-xs text-gray-500">{partner.role}</p></div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><EllipsisVerticalIcon className="h-5 w-5 text-gray-500" /></button>
              </div>
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {isLoading && messages.length === 0 ? <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}><div className="h-10 w-48 bg-gray-200 rounded-2xl animate-pulse" /></div>)}</div> : messages.length === 0 ? <div className="h-full flex items-center justify-center"><div className="text-center"><p className="text-gray-500 mb-4">Bắt đầu cuộc trò chuyện với {partner.full_name}</p><div className="flex flex-wrap gap-2 justify-center">{['Xin chào!', 'Phòng còn trống không?', 'Cho mình hỏi về phòng'].map(t => <button key={t} onClick={() => setNewMessage(t)} className="px-3 py-1.5 text-sm bg-white border rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700">{t}</button>)}</div></div></div> : Object.entries(groupedMsgs).map(([date, msgs]) => <div key={date}><div className="flex justify-center my-4"><span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full border">{formatDate(date)}</span></div>{msgs.map((m, i) => { const isCurr = chatHelpers.isMessageFromCurrentUser(m, user._id); const isFirst = i === 0 || msgs[i-1].sender !== m.sender; return <div key={m._id} className={`flex items-end space-x-2 ${isFirst ? 'mt-3' : 'mt-1'} ${isCurr ? 'justify-end' : 'justify-start'}`}>{!isCurr && <div className="w-8 h-8">{isFirst && <Image src={getAvatar(partner.avatar)} alt={partner.full_name} width={32} height={32} className="rounded-full" />}</div>}<div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isCurr ? 'bg-blue-600 text-white' : 'bg-white border text-gray-900'}`}><p className="text-sm break-words">{m.text}</p><div className="flex items-center justify-between mt-1 gap-2"><span className={`text-xs ${isCurr ? 'text-blue-100' : 'text-gray-500'}`}>{formatTime(m.createdAt)}</span>{isCurr && <MsgStatus s={m.status} />}</div></div>{isCurr && <div className="w-8 h-8">{isFirst && <Image src={getAvatar(user.avatar)} alt={user.full_name} width={32} height={32} className="rounded-full" />}</div>}</div>; })}</div>)}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-white border-t">
                <div className="flex items-end space-x-2">
                  <input ref={fileInputRef} type="file" onChange={() => toastManager.showInfo('Tính năng đính kèm đang phát triển')} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><PaperClipIcon className="h-5 w-5" /></button>
                  <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Nhập tin nhắn... (Enter để gửi)" rows={1} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 max-h-[120px] overflow-y-auto" />
                  <button onClick={sendMessage} disabled={!newMessage.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"><PaperAirplaneIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">{['Phòng còn trống không?', 'Giá thương lượng được không?', 'Khi nào xem phòng?'].map(t => <button key={t} onClick={() => setNewMessage(t)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 border">{t}</button>)}</div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md px-6">
                <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden mb-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Bars3Icon className="h-5 w-5 mr-2" />Xem danh sách</button>
                <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                {conversationNotFound && conversationIdFromUrl ? (
                  <>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">Không tìm thấy cuộc trò chuyện</h3>
                    <p className="text-gray-600 mb-6">Cuộc trò chuyện với ID "{conversationIdFromUrl}" không tồn tại hoặc bạn không có quyền truy cập.</p>
                    <button onClick={() => router.push('/chat')} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Quay lại danh sách
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tin nhắn của bạn</h3>
                    <p className="text-gray-600 mb-6">{conversations.length === 0 ? 'Bạn chưa có cuộc trò chuyện nào. Hãy bắt đầu chat với chủ nhà từ tin đăng!' : 'Chọn một cuộc trò chuyện từ danh sách để bắt đầu'}</p>
                    <div className="grid grid-cols-3 gap-3"><div className="bg-white p-3 rounded-lg border"><p className="text-xs font-medium text-gray-700">Realtime</p></div><div className="bg-white p-3 rounded-lg border"><p className="text-xs font-medium text-gray-700">Bảo mật</p></div><div className="bg-white p-3 rounded-lg border"><p className="text-xs font-medium text-gray-700">Nhanh chóng</p></div></div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

