import React, { useState, useEffect } from 'react';
import { Users, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserRole, Post } from '../types';
import { PostCard } from './PostCard';
import { useAuth } from '../lib/auth';

interface SearchResultsProps {
  query: string;
  userRole: UserRole;
  onNavigate: (view: string) => void;
  onViewPost: (post: Post) => void;
}

interface UserResult {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: 'STUDENT' | 'ORGANIZATION';
  professional_summary?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, userRole, onNavigate, onViewPost }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'users'>('posts');

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query]);

  const searchContent = async () => {
    setLoading(true);
    try {
      const searchTerm = `%${query}%`;

      const [postsResponse, usersResponse] = await Promise.all([
        supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            tags,
            visibility,
            image_url,
            likes_count,
            created_at,
            media_url,
            media_type,
            author_id,
            profiles:author_id (
              id,
              name,
              avatar_url,
              user_type
            )
          `)
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(20),

        supabase
          .from('profiles')
          .select('id, name, avatar_url, user_type, professional_summary')
          .or(`name.ilike.${searchTerm},professional_summary.ilike.${searchTerm}`)
          .limit(20)
      ]);

      if (postsResponse.data) {
        const formattedPosts: Post[] = postsResponse.data.map((post: any) => {
          const authorProfile = post.profiles;
          return {
            id: post.id,
            authorId: post.author_id,
            authorName: authorProfile?.name || 'Unknown',
            authorAvatar: authorProfile?.avatar_url || `https://picsum.photos/seed/${post.author_id}/100`,
            authorRole: authorProfile?.user_type === 'STUDENT' ? UserRole.STUDENT : UserRole.ORGANIZATION,
            authorVerified: false,
            type: 'Update',
            title: post.title,
            content: post.content,
            tags: post.tags || [],
            likes: post.likes_count || 0,
            comments: [],
            timestamp: formatTimestamp(post.created_at),
            isPublic: post.visibility === 'public',
            mediaUrl: post.media_url,
            mediaType: post.media_type
          };
        });
        setPosts(formattedPosts);
      }

      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('posts').delete().eq('id', postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => onNavigate('HOME')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">Search Results</h1>
          <p className="text-sm text-gray-600 font-medium mt-1">Results for "{query}"</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setSelectedTab('posts')}
            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'posts'
                ? 'text-black border-b-2 border-black bg-gray-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'users'
                ? 'text-black border-b-2 border-black bg-gray-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users className="w-5 h-5" />
            Users ({users.length})
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : selectedTab === 'posts' ? (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No posts found for "{query}"</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onViewPost={onViewPost}
                    isOwnPost={post.authorId === user?.id}
                    onDelete={handleDeletePost}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No users found for "{query}"</p>
                </div>
              ) : (
                users.map(userItem => (
                  <div key={userItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-4">
                      <img
                        src={userItem.avatar_url || `https://picsum.photos/seed/${userItem.id}/100`}
                        alt={userItem.name}
                        className="w-14 h-14 rounded-2xl border border-gray-100 object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-black text-black">{userItem.name}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                          {userItem.user_type}
                        </p>
                        {userItem.professional_summary && (
                          <p className="text-xs text-gray-600 font-medium mt-2 line-clamp-2">
                            {userItem.professional_summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all">
                      View Profile
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
