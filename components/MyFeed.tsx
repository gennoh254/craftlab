
import React, { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { UserRole, Post } from '../types';
import { ViewState } from '../App';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface MyFeedProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
  onViewPost?: (post: Post) => void;
}

interface DbPost {
  id: string;
  author_id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  visibility: string;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  created_at: string;
  profiles: {
    name: string;
    user_type: string;
    avatar_url: string | null;
  };
}

const MyFeed: React.FC<MyFeedProps> = ({ userRole, onNavigate, onViewPost }) => {
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPosts();
  }, [user?.id]);

  const fetchMyPosts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        type,
        title,
        content,
        tags,
        visibility,
        media_url,
        media_type,
        likes_count,
        created_at,
        profiles:author_id (
          name,
          user_type,
          avatar_url
        )
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formattedPosts: Post[] = data.map((post: DbPost) => ({
        id: post.id,
        authorId: post.author_id,
        authorName: post.profiles.name,
        authorAvatar: post.profiles.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="50" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3E?%3C/text%3E%3C/svg%3E',
        authorRole: post.profiles.user_type === 'STUDENT' ? UserRole.STUDENT : UserRole.ORGANIZATION,
        authorVerified: true,
        type: post.type,
        title: post.title,
        content: post.content,
        tags: post.tags,
        likes: post.likes_count,
        comments: [],
        timestamp: formatTimestamp(post.created_at),
        isPublic: post.visibility === 'public',
        mediaUrl: post.media_url || undefined,
        mediaType: (post.media_type as 'image' | 'video' | 'file') || undefined
      }));
      setPosts(formattedPosts);
    }
    setLoading(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeletingPostId(postId);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (!error) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPostId(null);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PostComposer userRole={userRole} onPostCreated={fetchMyPosts} />

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">My Posts</span>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm font-bold text-gray-500 mb-4">You haven't posted anything yet.</p>
          <button
            onClick={() => onNavigate('CREATE_POST')}
            className="px-6 py-2 bg-black text-[#facc15] rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors uppercase tracking-widest"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="relative">
              <PostCard post={post} onViewPost={onViewPost} />
              <button
                onClick={() => handleDeletePost(post.id)}
                disabled={deletingPostId === post.id}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete post"
              >
                {deletingPostId === post.id ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFeed;
