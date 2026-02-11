
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
  Plus,
  Mail
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

interface UserWithMessages {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: string;
  lastMessage?: string;
  lastMessageTime?: string;
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
  const [allUsers, setAllUsers] = useState<UserWithMessages[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithMessages[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchAllUsers();
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
          fetchAllUsers();
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

  const fetchAllUsers = async () => {
    if (!user) return;

    setLoading(true);

    const { data: allProfilesData } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, user_type')
      .neq('id', user.id)
      .order('name', { ascending: true });

    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (allProfilesData) {
      const messageMap = new Map<string, { lastMessage: Message; unread: number }>();

      if (messagesData) {
        messagesData.forEach((msg: Message) => {
          const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          const existing = messageMap.get(otherUserId);

          if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
            const unreadCount = existing?.unread || 0;
            messageMap.set(otherUserId, {
              lastMessage: msg,
              unread: msg.recipient_id === user.id && !msg.read ? unreadCount + 1 : unreadCount
            });
          } else if (msg.recipient_id === user.id && !msg.read) {
            messageMap.set(otherUserId, {
              lastMessage: existing.lastMessage,
              unread: existing.unread + 1
            });
          }
        });
      }

      const usersWithMessages: UserWithMessages[] = allProfilesData.map(p => {
        const messageData = messageMap.get(p.id);
        return {
          id: p.id,
          name: p.name,
          avatar_url: p.avatar_url,
          user_type: p.user_type,
          lastMessage: messageData?.lastMessage.content,
          lastMessageTime: messageData ? formatTime(messageData.lastMessage.created_at) : undefined,
          unreadCount: messageData?.unread || 0
        };
      });

      usersWithMessages.sort((a, b) => {
        if (a.lastMessageTime && !b.lastMessageTime) return -1;
        if (!a.lastMessageTime && b.lastMessageTime) return 1;
        if (a.lastMessageTime && b.lastMessageTime) {
          const aMsg = messageMap.get(a.id)!.lastMessage;
          const bMsg = messageMap.get(b.id)!.lastMessage;
          return new Date(bMsg.created_at).getTime() - new Date(aMsg.created_at).getTime();
        }
        return a.name.localeCompare(b.name);
      });

      setAllUsers(usersWithMessages);
      setFilteredUsers(usersWithMessages);
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

    fetchAllUsers();
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
      fetchAllUsers();
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserClick = (userId: string) => {
    setActiveChat(userId);
    fetchMessages(userId);
    markMessagesAsRead(userId);
  };

  const currentUser = allUsers.find(u => u.id === activeChat);

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-black text-white">
          <h2 className="font-black text-[10px] uppercase tracking-widest mb-3">All Users</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-[#facc15] font-medium text-white placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-gray-500 font-medium">No users found</p>
            </div>
          ) : (
            filteredUsers.map((userItem) => (
              <div
                key={userItem.id}
                className={`p-4 border-b border-gray-100 transition-colors ${
                  activeChat === userItem.id ? 'bg-[#facc15]/10 border-r-4 border-r-[#facc15]' : 'hover:bg-white'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <img
                    src={userItem.avatar_url || `https://picsum.photos/seed/${userItem.id}/100`}
                    className="w-11 h-11 rounded-lg border border-gray-100"
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-black text-[11px] text-black truncate">{userItem.name}</h4>
                      {userItem.lastMessageTime && (
                        <span className="text-[8px] text-gray-400 font-bold uppercase">
                          {userItem.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 font-black truncate uppercase tracking-tighter mb-2">
                      {userItem.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                    </p>
                    {userItem.lastMessage && (
                      <p className="text-[10px] text-gray-600 truncate font-medium mb-2">
                        {userItem.lastMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserClick(userItem.id)}
                        className="flex-1 py-1.5 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all shadow-sm flex items-center justify-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        Message
                      </button>
                      {userItem.unreadCount > 0 && (
                        <span className="bg-[#facc15] text-black text-[8px] font-black px-2 py-1 rounded-full">
                          {userItem.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {currentUser && activeChat ? (
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar_url || `https://picsum.photos/seed/${currentUser.id}/100`}
                className="w-10 h-10 rounded-lg border border-gray-100"
                alt="Current chat"
              />
              <div>
                <h3 className="font-black text-xs text-black">{currentUser.name}</h3>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  {currentUser.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                </p>
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
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center p-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-black mb-2">Select a User</h3>
            <p className="text-sm text-gray-500 font-medium">Choose a user from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;
