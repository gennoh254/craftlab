
import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Home,
  User,
  CheckCircle,
  ChevronDown,
  LogOut,
  Briefcase,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { Profile } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface HeaderProps {
  userRole: UserRole;
  activeView: ViewState;
  onViewChange: (view: ViewState, searchQuery?: string) => void;
  profile: Profile;
}

const Header: React.FC<HeaderProps> = ({ userRole, activeView, onViewChange, profile }) => {
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      onViewChange('SEARCH', query);
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(true);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'ALL_OPPORTUNITIES', label: 'Opportunities', icon: Briefcase },
    { id: 'INBOX', label: 'Inbox', icon: MessageSquare },
    { id: 'DASHBOARD', label: 'Me', icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-[#facc15]/30 z-50 px-4 shadow-md">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-4 flex-1">
          <div 
            onClick={() => onViewChange('HOME')}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#facc15] rounded-lg flex items-center justify-center font-black text-black text-xl hover:scale-105 transition-transform">
              CC
            </div>
            <span className="hidden lg:block text-[#facc15] font-black text-xl tracking-tighter">Craftlab Careers</span>
          </div>
          <div className="hidden sm:block max-w-xs w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search posts & users..."
              className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-8 py-1.5 rounded text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {showSearchDropdown && searchQuery && (
              <button
                onClick={() => handleSearch(searchQuery)}
                className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors w-full text-left flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search for "{searchQuery}"
              </button>
            )}
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center h-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`flex flex-col items-center justify-center h-full px-6 border-b-2 transition-all group ${
                activeView === item.id 
                  ? 'border-[#facc15] text-[#facc15]' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-[#facc15]' : 'group-hover:scale-110'} transition-transform`} />
              <span className="text-[10px] font-black mt-1 uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: Profile Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-8 w-px bg-gray-700 mx-1 hidden lg:block"></div>
          
          <div className="relative group">
            <button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-800 transition-colors">
              <img
                src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100`}
                alt="Avatar"
                className="w-8 h-8 rounded-lg border border-[#facc15]"
              />
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-black text-base tracking-tight truncate max-w-[140px]">
                    {profile.name}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-[#facc15]" fill="currentColor" />
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <div className="absolute right-0 top-full mt-2 w-56 bg-black border border-gray-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
               <button
                 onClick={handleSignOut}
                 className="w-full text-left px-4 py-3 text-[10px] font-black text-gray-300 hover:text-[#facc15] hover:bg-gray-900 uppercase tracking-widest flex items-center gap-3"
               >
                 <LogOut className="w-4 h-4" />
                 Sign Out
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
