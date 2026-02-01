
import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  MoreHorizontal,
  CheckCircle,
  Link,
  Send
} from 'lucide-react';
import { Post, UserRole } from '../types';

interface PostCardProps {
  post: Post;
  isOrgView?: boolean;
  onViewPost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onViewPost }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');

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
        <button className="text-gray-300 hover:text-black transition-colors p-2"><MoreHorizontal className="w-6 h-6" /></button>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <h3 className="text-xl font-black text-black leading-tight tracking-tight">{post.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          {post.content}
        </p>
        
        <div 
          onClick={() => onViewPost?.(post)}
          className="rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[16/9] flex flex-col items-center justify-center gap-3 group cursor-pointer relative shadow-inner"
        >
          <img src={`https://picsum.photos/seed/${post.id}/800/450`} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="Post content" />
          <div className="z-10 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-200 text-xs font-black text-black uppercase tracking-widest flex items-center gap-3 scale-95 group-hover:scale-100 transition-all">
            <Link className="w-4 h-4 text-[#facc15]" /> View Showcase Detail
          </div>
        </div>

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
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 text-xs font-black transition-all ${isLiked ? 'text-[#facc15]' : 'text-gray-400 hover:text-black'}`}
          >
            <ThumbsUp className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} /> {post.likes + (isLiked ? 1 : 0)}
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-black transition-all"
          >
            <MessageSquare className="w-4.5 h-4.5" /> {post.comments.length}
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
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-4">
                <img src={`https://picsum.photos/seed/${comment.userName}/40`} className="w-8 h-8 rounded-xl shrink-0 border border-gray-100" alt="User" />
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-black uppercase tracking-tight">{comment.userName}</span>
                    <span className="text-[8px] font-bold text-gray-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-gray-100 p-2.5 focus-within:border-black transition-all shadow-sm">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Post a professional insight..." 
              className="flex-1 bg-transparent text-xs font-bold px-3 focus:outline-none"
            />
            <button 
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
