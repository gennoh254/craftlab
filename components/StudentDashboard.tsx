
import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Edit3, 
  Briefcase,
  Zap,
  Calendar,
  Heart,
  Target,
  Building,
  Sparkles,
  FileText,
  Award,
  Check,
  Cpu
} from 'lucide-react';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { MOCK_POSTS, MOCK_CERTIFICATES } from '../constants';
import { UserRole, Post } from '../types';
import { ViewState } from '../App';

interface StudentDashboardProps {
  onNavigate: (view: ViewState) => void;
  onViewPost?: (post: Post) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onViewPost }) => {
  const [activeFeedTab, setActiveFeedTab] = useState('Your Posts');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: Profile + CV Builder Badge */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-24 bg-black relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-[1.5rem] shadow-2xl">
               <img src="https://picsum.photos/seed/alex/150" className="w-24 h-24 rounded-[1.2rem] object-cover" alt="Student" />
            </div>
            <div className="absolute top-3 right-3 bg-[#facc15] text-black text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Check className="w-3 h-3" /> CV Ready
            </div>
          </div>
          <div className="pt-14 px-6 pb-8 space-y-6 text-center">
            <div>
              <h2 className="text-3xl font-black text-black tracking-tighter leading-none">Alex Rivers</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">Senior UX/UI Specialist</p>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
              "Developing spatial user interfaces for next-generation platforms."
            </p>

            <div className="space-y-6 pt-4 border-t border-gray-50 text-left">
              <div>
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Award className="w-4 h-4 text-[#facc15]" /> Top Qualifications
                </h4>
                <div className="space-y-2">
                  {MOCK_CERTIFICATES.slice(0, 2).map(cert => (
                    <div key={cert.id} className="text-[10px] font-black text-black flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
                      <span className="truncate">{cert.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Heart className="w-4 h-4 text-red-400" /> Interests
                </h4>
                <div className="flex flex-wrap gap-1">
                  {['Spatial Computing', 'Generative AI', 'Urban Design'].map(tag => (
                    <span key={tag} className="text-[8px] font-black bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <button 
                onClick={() => onNavigate('EDIT_PROFILE')}
                className="w-full py-4 bg-black text-[#facc15] font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95"
              >
                Refine Profile
              </button>
              <button 
                onClick={() => onNavigate('EDIT_PROFILE')}
                className="w-full py-4 bg-gray-50 text-gray-700 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#facc15]" /> CV Builder
              </button>
            </div>
          </div>
        </div>

        {/* Certificate Proofs Gallery */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-6 space-y-6">
          <h3 className="font-black text-black flex items-center gap-2 text-xs uppercase tracking-widest">
            <Award className="w-5 h-5 text-[#facc15]" /> Verified Credentials
          </h3>
          <div className="space-y-4">
            {MOCK_CERTIFICATES.map(cert => (
              <div key={cert.id} className="relative group rounded-2xl overflow-hidden border-2 border-gray-50 bg-gray-50 aspect-[4/3] cursor-pointer shadow-sm">
                <img src={cert.proofImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] text-white font-black truncate uppercase">{cert.title}</p>
                  <p className="text-[8px] text-[#facc15] font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Check className="w-2.5 h-2.5" /> SECURE PROOF
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Feed */}
      <div className="lg:col-span-6 space-y-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-200">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-black text-black uppercase tracking-tight">Recruiter Insights</h2>
             <button 
               onClick={() => onNavigate('CREATE_POST')}
               className="flex items-center gap-2 px-6 py-3 bg-black text-[#facc15] font-black rounded-2xl text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Post Update
             </button>
           </div>
           
           <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Impact</p>
                <p className="text-3xl font-black text-black">2.4k</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Syncs</p>
                <p className="text-3xl font-black text-black">14</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">CV Pulls</p>
                <p className="text-3xl font-black text-black">32</p>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-8 border-b-2 border-gray-100">
            {['Your Posts', 'Community Feed'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveFeedTab(tab)}
                className={`text-[11px] font-black uppercase tracking-widest pb-4 transition-all border-b-4 ${activeFeedTab === tab ? 'border-[#facc15] text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {MOCK_POSTS.filter(p => activeFeedTab === 'Your Posts' ? p.authorRole === UserRole.STUDENT : true).map(post => (
              <PostCard key={post.id} post={post} onViewPost={onViewPost} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Seeking Opportunities & Preferred Orgs */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-black text-white rounded-[2rem] shadow-2xl p-8 space-y-8 border border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="font-black flex items-center gap-3 text-[11px] uppercase tracking-widest text-[#facc15]">
              <Target className="w-4 h-4" /> Active Search
            </h3>
            <button 
              onClick={handleRefresh}
              className={`p-1 transition-all ${isRefreshing ? 'animate-spin text-[#facc15]' : 'text-gray-600 hover:text-[#facc15]'}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Interested In:</p>
            <div className="flex flex-wrap gap-2">
              {['Internship', 'Apprenticeship', 'Volunteer'].map(role => (
                <span key={role} className="px-3 py-1.5 bg-white/5 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 border border-white/10 group cursor-default">
                  {role} <Check className="w-3 h-3 text-green-500" />
                </span>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4">
            <h4 className="text-[11px] font-black text-[#facc15] uppercase tracking-widest flex items-center gap-2">
               <Building className="w-4 h-4" /> Preferred Partners
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {['Meta Lab', 'Future Tech', 'Google', 'R/GA'].map(org => (
                <div key={org} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition-all">
                  {org}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('ALL_OPPORTUNITIES')}
            className="w-full py-4 bg-[#facc15] text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
          >
            Match Secure Roles
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-8 space-y-6">
          <h3 className="font-black text-black text-[10px] uppercase tracking-[0.2em] text-center">AI Sync Status</h3>
          <div className="space-y-1 text-center bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 shadow-inner">
             <div className="text-4xl font-black text-black">94%</div>
             <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-2 font-black">Live Profile Sync</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
