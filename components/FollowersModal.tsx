import React, { useState, useEffect } from 'react';
import { X, Loader2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: string;
  professional_summary?: string;
}

const FollowersModal: React.FC<FollowersModalProps> = ({ isOpen, onClose, type }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUsers();
    }
  }, [isOpen, user, type]);

  const fetchUsers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (type === 'followers') {
        const { data } = await supabase
          .from('connections')
          .select(`
            follower_id,
            profiles:follower_id (
              id,
              name,
              avatar_url,
              user_type,
              professional_summary
            )
          `)
          .eq('following_id', user.id);

        if (data) {
          setUsers(data.map((item: any) => item.profiles).filter(Boolean));
        }
      } else {
        const { data } = await supabase
          .from('connections')
          .select(`
            following_id,
            profiles:following_id (
              id,
              name,
              avatar_url,
              user_type,
              professional_summary
            )
          `)
          .eq('follower_id', user.id);

        if (data) {
          setUsers(data.map((item: any) => item.profiles).filter(Boolean));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#facc15]" />
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                No {type === 'followers' ? 'Followers' : 'Following'} Yet
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {type === 'followers'
                  ? 'Users who follow you will appear here'
                  : 'Users you follow will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((userProfile) => (
                <div
                  key={userProfile.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={userProfile.avatar_url || `https://picsum.photos/seed/${userProfile.id}/100`}
                    alt={userProfile.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-black truncate">
                      {userProfile.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                      {userProfile.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                    </p>
                    {userProfile.professional_summary && (
                      <p className="text-xs text-gray-600 font-medium truncate mt-1">
                        {userProfile.professional_summary.substring(0, 50)}
                        {userProfile.professional_summary.length > 50 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-center font-black text-gray-400 uppercase tracking-widest">
            {users.length} {type === 'followers' ? 'Follower' : 'Following'}{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
