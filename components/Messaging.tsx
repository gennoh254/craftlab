
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MoreVertical,
  Edit,
  Send,
  Image,
  Paperclip,
  Smile,
  Phone,
  Video,
  MessageSquare,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface MessagingProps {
  userRole: UserRole;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: string;
}

const Messaging: React.FC<MessagingProps> = ({ userRole }) => {
  const { user, profile } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat && user) {
      fetchMessages(activeChat);
      markMessagesAsRead(activeChat);
    }
  }, [activeChat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !activeChat) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === activeChat) {
            setMessages(prev => [...prev, newMessage]);
            markMessagesAsRead(activeChat);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messagesData) {
      const conversationMap = new Map<string, { lastMessage: Message; unread: number }>();

      messagesData.forEach((msg: Message) => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const existing = conversationMap.get(otherUserId);

        if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
          const unreadCount = existing?.unread || 0;
          conversationMap.set(otherUserId, {
            lastMessage: msg,
            unread: msg.recipient_id === user.id && !msg.read ? unreadCount + 1 : unreadCount
          });
        } else if (msg.recipient_id === user.id && !msg.read) {
          conversationMap.set(otherUserId, {
            lastMessage: existing.lastMessage,
            unread: existing.unread + 1
          });
        }
      });

      const userIds = Array.from(conversationMap.keys());
      if (userIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, user_type')
        .in('id', userIds);

      if (profilesData) {
        const convos: Conversation[] = profilesData.map(p => {
          const convData = conversationMap.get(p.id)!;
          return {
            userId: p.id,
            userName: p.name,
            userAvatar: p.avatar_url || `https://picsum.photos/seed/${p.id}/100`,
            userRole: p.user_type === 'STUDENT' ? 'Student' : 'Organization',
            lastMessage: convData.lastMessage.content,
            lastMessageTime: formatTime(convData.lastMessage.created_at),
            unreadCount: convData.unread
          };
        });

        convos.sort((a, b) => {
          const aMsg = conversationMap.get(a.userId)!.lastMessage;
          const bMsg = conversationMap.get(b.userId)!.lastMessage;
          return new Date(bMsg.created_at).getTime() - new Date(aMsg.created_at).getTime();
        });

        setConversations(convos);
        if (convos.length > 0 && !activeChat) {
          setActiveChat(convos[0].userId);
        }
      }
    }
    setLoading(false);
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', user.id)
      .eq('read', false);

    fetchConversations();
  };

  const handleSendMessage = async () => {
    if (!user || !activeChat || !message.trim() || sending) return;

    setSending(true);
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: activeChat,
        content: message.trim()
      })
      .select()
      .single();

    if (data) {
      setMessages(prev => [...prev, data]);
      setMessage('');
      fetchConversations();
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, user_type')
      .ilike('name', `%${query}%`)
      .neq('id', user?.id || '')
      .limit(10);

    if (data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const startConversation = async (userId: string) => {
    if (!user) return;

    setActiveChat(userId);
    setShowNewMessageModal(false);
    setSearchQuery('');
    setSearchResults([]);

    const conversationExists = conversations.some(c => c.userId === userId);
    if (!conversationExists) {
      await fetchConversations();
    }
  };

  const currentConversation = conversations.find(c => c.userId === activeChat);

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-black text-black mb-2">No Messages Yet</h3>
        <p className="text-sm text-gray-500 font-medium">Start connecting with other users to begin messaging.</p>
      </div>
    );
  }

  return (
    <>
    <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-black text-white">
          <h2 className="font-black text-[10px] uppercase tracking-widest">Messages</h2>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="text-[#facc15] hover:scale-110 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#facc15] font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <div
              key={chat.userId}
              onClick={() => setActiveChat(chat.userId)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-100 ${activeChat === chat.userId ? 'bg-[#facc15]/10 border-r-4 border-r-[#facc15]' : 'hover:bg-white'}`}
            >
              <img src={chat.userAvatar} className="w-11 h-11 rounded-lg border border-gray-100" alt="Chat avatar" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-black text-[11px] text-black truncate">{chat.userName}</h4>
                  <span className="text-[8px] text-gray-400 font-bold uppercase">{chat.lastMessageTime}</span>
                </div>
                <p className="text-[9px] text-gray-500 font-black truncate uppercase tracking-tighter mb-1">{chat.userRole}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-600 truncate font-medium flex-1">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-[#facc15] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentConversation && (
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <img src={currentConversation.userAvatar} className="w-10 h-10 rounded-lg border border-gray-100" alt="Current chat" />
              <div>
                <h3 className="font-black text-xs text-black">{currentConversation.userName}</h3>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{currentConversation.userRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-gray-400">
              <Phone className="w-4.5 h-4.5 hover:text-black cursor-pointer transition-colors" />
              <Video className="w-4.5 h-4.5 hover:text-black cursor-pointer transition-colors" />
              <MoreVertical className="w-4.5 h-4.5 hover:text-black cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                    isMine
                      ? 'bg-black text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    <p className="text-xs leading-relaxed font-medium">{msg.content}</p>
                    <p className={`text-[8px] mt-2 font-black uppercase ${isMine ? 'text-[#facc15]/80' : 'text-gray-400'}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-5 px-1">
                <Image className="w-4.5 h-4.5 text-gray-400 hover:text-black cursor-pointer" />
                <Paperclip className="w-4.5 h-4.5 text-gray-400 hover:text-black cursor-pointer" />
                <Smile className="w-4.5 h-4.5 text-gray-400 hover:text-black cursor-pointer" />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:border-black transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Reply securely..."
                  className="flex-1 bg-transparent text-sm font-medium px-2 focus:outline-none resize-none h-10 py-2"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                  className={`p-3 rounded-lg transition-all shadow-md ${message.trim() && !sending ? 'bg-black text-[#facc15] hover:scale-105' : 'bg-gray-200 text-gray-400'}`}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {showNewMessageModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-black text-white">
            <h2 className="font-black text-[13px] uppercase tracking-widest">Start New Message</h2>
            <button
              onClick={() => {
                setShowNewMessageModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#facc15] font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#facc15] animate-spin" />
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500 font-medium">No users found</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500 font-medium">Search for users to message</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startConversation(user.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <img
                      src={user.avatar_url || `https://picsum.photos/seed/${user.id}/40`}
                      className="w-10 h-10 rounded-lg border border-gray-200"
                      alt={user.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-black truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase">
                        {user.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Messaging;
