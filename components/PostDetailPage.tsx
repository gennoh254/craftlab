
import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Building,
  Mail,
  MoreVertical
} from 'lucide-react';
import { Post, UserRole } from '../types';
import { ViewState } from '../App';

interface PostDetailPageProps {
  post: Post;
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const PostDetailPage: React.FC<PostDetailPageProps> = ({ post, userRole, onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('HOME')}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors shadow-sm">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors shadow-sm">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Project Hero Image */}
            <div className="relative aspect-video bg-gray-100 group">
              <img 
                src={`https://picsum.photos/seed/${post.id}/1200/800`} 
                className="w-full h-full object-cover" 
                alt="Showcase Content" 
              />
              <div className="absolute top-4 right-4 px-4 py-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#facc15]" /> Authenticity Verified
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-lg border border-gray-100">#{tag}</span>
                ))}
              </div>
              
              <h1 className="text-4xl font-black text-black tracking-tight leading-none">{post.title}</h1>
              
              <div className="flex items-center gap-4 py-4 border-y border-gray-50">
                 <img src={post.authorAvatar} className="w-12 h-12 rounded-xl" alt="Author" />
                 <div>
                   <div className="flex items-center gap-1.5">
                     <h3 className="font-black text-black">{post.authorName}</h3>
                     <CheckCircle className="w-3.5 h-3.5 text-[#facc15]" fill="currentColor" />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Published {post.timestamp} • SF, CA</p>
                 </div>
                 <button className="ml-auto px-6 py-2 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all">Follow</button>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium text-lg">
                <p>{post.content}</p>
                <p className="mt-4">
                  This project represents a synthesis of technical proficiency and creative vision. 
                  Leveraging modern frameworks and a user-centric methodology, we addressed complex 
                  spatial interaction challenges to deliver a seamless UX experience.
                </p>
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-black">
                  <ThumbsUp className="w-4 h-4" /> {post.likes} ENDORSEMENTS
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-black">
                  <MessageSquare className="w-4 h-4" /> {post.comments.length} COMMENTS
                </button>
              </div>
              <button className="text-gray-400 hover:text-black"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
            <h2 className="text-[11px] font-black text-black uppercase tracking-widest">Professional Feedback</h2>
            <div className="space-y-6">
              {post.comments.map(c => (
                <div key={c.id} className="flex gap-4">
                  <img src={`https://picsum.photos/seed/${c.userName}/60`} className="w-10 h-10 rounded-lg shrink-0" alt="User" />
                  <div className="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-black uppercase">{c.userName}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{c.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <aside className="lg:col-span-4 space-y-6">
          {userRole === UserRole.ORGANIZATION && (
            <div className="bg-black rounded-2xl p-6 shadow-2xl border border-white/10 space-y-6">
              <div className="flex items-center gap-3 text-[#facc15]">
                <Zap className="w-6 h-6" />
                <h3 className="text-white font-black text-[11px] uppercase tracking-widest">Recruiter Actions</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full py-4 bg-[#facc15] text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" /> Shortlist for Role
                </button>
                <button className="w-full py-4 border border-white/20 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> Direct Message
                </button>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight text-center">
                This candidate is in the top 5% for your "UX INTERN" pipeline.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Skill Verification</h3>
             <div className="space-y-4">
               {['Visual Design', 'Interaction Prototyping', 'Spatial UX'].map(skill => (
                 <div key={skill} className="flex items-center justify-between">
                   <span className="text-xs font-bold text-black">{skill}</span>
                   <div className="flex gap-1">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-[#facc15]' : 'bg-gray-100'}`} />
                     ))}
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-800">
             <h3 className="text-[10px] font-black text-[#facc15] uppercase tracking-widest">AI Profile Analysis</h3>
             <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
               "This showcase demonstrates a strong mastery of {post.tags[0]} and {post.tags[1]}. 
               Suggested career trajectory: <span className="text-white font-bold">Spatial Interface Designer</span>."
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostDetailPage;
