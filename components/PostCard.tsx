
import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  CheckCircle,
  Link,
  Send,
  Paperclip,
  Loader2,
  Trash2
} from 'lucide-react';
import { Post, UserRole, Comment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface PostCardProps {
  post: Post;
  isOrgView?: boolean;
  onViewPost?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  isOwnPost?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onViewPost, onDelete, isOwnPost }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState(post.likes);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, post.id]);

  const checkIfLiked = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsLiked(!!data);
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (data) {
      const formattedComments: Comment[] = data.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.profiles.name,
        userAvatar: c.profiles.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23f3f4f6" width="40" height="40"/%3E%3Ctext x="20" y="20" font-size="20" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3E?%3C/text%3E%3C/svg%3E',
        content: c.content,
        timestamp: formatTimestamp(c.created_at)
      }));
      setComments(formattedComments);
    }
    setLoadingComments(false);
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        setIsLiked(false);
        setLikesCount(likesCount - 1);

        await supabase
          .from('posts')
          .update({ likes_count: likesCount - 1 })
          .eq('id', post.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });

        setIsLiked(true);
        setLikesCount(likesCount + 1);

        await supabase
          .from('posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', post.id);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !commentText.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: user.id,
        content: commentText
      });

    if (!error) {
      setCommentText('');
      await fetchComments();
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      onDelete?.(post.id);
    } finally {
      setIsDeleting(false);
      setShowMoreMenu(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-2xl border border-gray-100 shadow-sm" />
            {post.authorVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                <CheckCircle className="w-4 h-4 text-[#facc15]" fill="currentColor" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-black tracking-tight leading-tight">{post.authorName}</h4>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                post.authorRole === UserRole.STUDENT ? 'bg-gray-100 text-gray-500' : 'bg-black text-[#facc15]'
              }`}>
                {post.authorRole}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{post.timestamp}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="text-gray-300 hover:text-black transition-colors p-2"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
          {showMoreMenu && isOwnPost && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 flex items-center gap-2 font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Post
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <h3 className="text-xl font-black text-black leading-tight tracking-tight">{post.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          {post.content}
        </p>
        
        {post.mediaUrl && (
          <div className="rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 group relative shadow-inner">
            {post.mediaType === 'image' ? (
              <img src={post.mediaUrl} alt="Post media" className="w-full max-h-96 object-cover group-hover:opacity-90 transition-opacity duration-300" />
            ) : post.mediaType === 'video' ? (
              <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
            ) : (
              <div className="p-6 bg-gray-50 flex items-center justify-center min-h-[200px]">
                <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black text-[#facc15] rounded-lg font-bold text-sm hover:bg-gray-800">
                  <Paperclip className="w-4 h-4" /> Download File
                </a>
              </div>
            )}
            <button
              onClick={() => onViewPost?.(post)}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 group/btn"
            >
              <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-200 text-xs font-black text-black uppercase tracking-widest flex items-center gap-3 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                <Link className="w-4 h-4 text-[#facc15]" /> View Detail
              </div>
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-[9px] font-black text-[#facc15] bg-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
        <div className="flex items-center gap-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-xs font-black transition-all ${isLiked ? 'text-[#facc15]' : 'text-gray-400 hover:text-black'}`}
          >
            <ThumbsUp className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} /> {likesCount}
          </button>
          <button
            onClick={() => {
              if (!showComments) {
                fetchComments();
              }
              setShowComments(!showComments);
            }}
            className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-black transition-all"
          >
            <MessageSquare className="w-4.5 h-4.5" /> {comments.length}
          </button>
          <button className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-black transition-all">
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
        <button className="text-gray-300 hover:text-[#facc15] transition-colors p-1">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {showComments && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-6 space-y-6">
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-[#facc15] animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No comments yet</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <img src={comment.userAvatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23f3f4f6" width="40" height="40"/%3E%3Ctext x="20" y="20" font-size="20" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3E?%3C/text%3E%3C/svg%3E'} className="w-8 h-8 rounded-xl shrink-0 border border-gray-100 object-cover" alt="User" />
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-black uppercase tracking-tight">{comment.userName}</span>
                      <span className="text-[8px] font-bold text-gray-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-gray-100 p-2.5 focus-within:border-black transition-all shadow-sm">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
              placeholder="Post a professional insight..."
              className="flex-1 bg-transparent text-xs font-bold px-3 focus:outline-none"
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText}
              className={`p-3 rounded-xl transition-all shadow-xl ${commentText ? 'bg-black text-[#facc15] hover:scale-105' : 'bg-gray-100 text-gray-300'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
