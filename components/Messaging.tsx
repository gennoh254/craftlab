
import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { UserRole } from '../types';

interface MessagingProps {
  userRole: UserRole;
}

const Messaging: React.FC<MessagingProps> = ({ userRole }) => {
  const [activeChat, setActiveChat] = useState(0);
  const [message, setMessage] = useState('');

  const chats = [
    { 
      name: 'Sarah Chen', 
      role: 'UI Lead @ Meta', 
      lastMsg: 'Looking forward to seeing your portfolio update!', 
      time: '12m',
      avatar: 'https://picsum.photos/seed/Sarah/100',
      messages: [
        { sender: 'them', text: 'Hey Alex, really liked your recent project on spatial UI!', time: '10:15 AM' },
        { sender: 'me', text: 'Thanks Sarah! It was a lot of hard work but very rewarding.', time: '10:17 AM' },
        { sender: 'them', text: 'Looking forward to seeing your portfolio update!', time: '10:20 AM' },
      ]
    },
    { 
      name: 'Innovate Labs', 
      role: 'Tech Organization', 
      lastMsg: 'Your match score is 98% for our intern role.', 
      time: '1h',
      avatar: 'https://picsum.photos/seed/lab/100',
      messages: [
        { sender: 'them', text: 'Your match score is 98% for our intern role.', time: 'Yesterday' }
      ]
    }
  ];

  const currentChat = chats[activeChat];

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-black text-white">
          <h2 className="font-black text-[10px] uppercase tracking-widest">Messages</h2>
          <Edit className="w-4 h-4 text-[#facc15] cursor-pointer" />
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
          {chats.map((chat, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveChat(idx)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-100 ${activeChat === idx ? 'bg-[#facc15]/10 border-r-4 border-r-[#facc15]' : 'hover:bg-white'}`}
            >
              <img src={chat.avatar} className="w-11 h-11 rounded-lg border border-gray-100" alt="Chat avatar" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-black text-[11px] text-black truncate">{chat.name}</h4>
                  <span className="text-[8px] text-gray-400 font-bold uppercase">{chat.time}</span>
                </div>
                <p className="text-[9px] text-gray-500 font-black truncate uppercase tracking-tighter mb-1">{chat.role}</p>
                <p className="text-[10px] text-gray-600 truncate font-medium">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <img src={currentChat.avatar} className="w-10 h-10 rounded-lg border border-gray-100" alt="Current chat" />
            <div>
              <h3 className="font-black text-xs text-black">{currentChat.name}</h3>
              <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">Active Now</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-gray-400">
            <Phone className="w-4.5 h-4.5 hover:text-black cursor-pointer transition-colors" />
            <Video className="w-4.5 h-4.5 hover:text-black cursor-pointer transition-colors" />
            <MoreVertical className="w-4.5 h-4.5 hover:text-black cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20">
          {currentChat.messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.sender === 'me' 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="text-xs leading-relaxed font-medium">{msg.text}</p>
                <p className={`text-[8px] mt-2 font-black uppercase ${msg.sender === 'me' ? 'text-[#facc15]/80' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
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
                placeholder="Reply securely..." 
                className="flex-1 bg-transparent text-sm font-medium px-2 focus:outline-none resize-none h-10 py-2"
              />
              <button 
                disabled={!message}
                className={`p-3 rounded-lg transition-all shadow-md ${message ? 'bg-black text-[#facc15] hover:scale-105' : 'bg-gray-200 text-gray-400'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
