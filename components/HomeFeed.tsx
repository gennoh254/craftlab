
import React from 'react';
import { TrendingUp, Users, Briefcase, ChevronRight } from 'lucide-react';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { MOCK_POSTS, MOCK_OPPORTUNITIES } from '../constants';
import { UserRole, Post } from '../types';
import { ViewState } from '../App';

interface HomeFeedProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
  onViewPost?: (post: Post) => void;
}

const HomeFeed: React.FC<HomeFeedProps> = ({ userRole, onNavigate, onViewPost }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Profile Summary */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-14 bg-black"></div>
          <div className="px-4 pb-4 -mt-8 flex flex-col items-center text-center">
            <img 
              src={userRole === UserRole.STUDENT ? "https://picsum.photos/seed/alex/100" : "https://picsum.photos/seed/lab/100"} 
              className="w-16 h-16 rounded-xl border-4 border-white object-cover bg-white mb-2" 
              alt="Avatar"
            />
            <h3 className="font-black text-black text-sm tracking-tight">
              {userRole === UserRole.STUDENT ? 'Alex Rivers' : 'Innovate Labs'}
            </h3>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
              {userRole === UserRole.STUDENT ? 'UX Design Student' : 'Pioneering Future Tech'}
            </p>
            
            <div className="w-full border-t border-gray-100 mt-4 pt-4 space-y-2 text-left">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                <span className="text-gray-400">Views</span>
                <span className="text-[#facc15]">142</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                <span className="text-gray-400">Network</span>
                <span className="text-[#facc15]">482</span>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="w-full mt-4 py-2 text-[10px] font-black bg-black text-[#facc15] rounded-lg hover:bg-gray-800 transition-all uppercase tracking-widest shadow-sm"
            >
              My Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h4 className="text-[10px] font-black text-black flex items-center gap-2 mb-3 uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5 text-[#facc15]" /> Trending Topics
          </h4>
          <div className="space-y-3">
            {['#SpatialComputing', '#UXDesign', '#OpenSource', '#FutureTalent'].map(tag => (
              <div key={tag} className="text-[11px] font-bold text-gray-500 hover:text-black cursor-pointer transition-colors">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: The Feed */}
      <div className="lg:col-span-6 space-y-6">
        <PostComposer userRole={userRole} />
        
        <div className="flex items-center gap-4">
           <div className="h-px flex-1 bg-gray-200"></div>
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Community</span>
           <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        <div className="space-y-6">
          {MOCK_POSTS.map(post => (
            <PostCard key={post.id} post={post} onViewPost={onViewPost} />
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Opportunities */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
           <h4 className="text-[10px] font-black text-black flex items-center gap-2 mb-4 uppercase tracking-widest">
             <Briefcase className="w-3.5 h-3.5 text-[#facc15]" /> Hot Opportunities
           </h4>
           <div className="space-y-4">
              {MOCK_OPPORTUNITIES.slice(0, 3).map((opp, i) => (
                <div key={i} className="group border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <h5 className="text-[11px] font-black text-black group-hover:text-[#facc15] transition-colors cursor-pointer">{opp.role}</h5>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{opp.orgName} • {opp.type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black text-green-500 bg-green-50 px-1.5 rounded uppercase">{opp.matchScore}% Match</span>
                    <ChevronRight className="w-3 h-3 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
           </div>
           <button 
             onClick={() => onNavigate('ALL_OPPORTUNITIES')}
             className="w-full mt-3 py-2 text-[10px] font-black text-gray-400 hover:text-black border border-gray-200 rounded-lg uppercase tracking-widest transition-colors"
           >
             See all roles
           </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
           <h4 className="text-[10px] font-black text-black flex items-center gap-2 mb-4 uppercase tracking-widest">
             <Users className="w-3.5 h-3.5 text-[#facc15]" /> Networking
           </h4>
           <div className="space-y-4">
              {[
                { name: 'Sarah Chen', role: 'UI Lead @ Meta', avatar: 'Sarah' },
                { name: 'Future Design', role: 'Agency', avatar: 'Future' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={`https://picsum.photos/seed/${item.avatar}/40`} className="w-9 h-9 rounded-full" alt="User" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-black leading-tight truncate">{item.name}</p>
                    <p className="text-[9px] font-bold text-gray-500 leading-tight uppercase truncate">{item.role}</p>
                  </div>
                  <button className="text-[9px] font-black text-black bg-[#facc15] px-2 py-1 rounded uppercase hover:scale-105 transition-all">Follow</button>
                </div>
              ))}
           </div>
        </div>

        <footer className="px-4 text-[9px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 font-black uppercase tracking-widest">
          <span>About</span>
          <span>Help</span>
          <span>Terms</span>
          <span>© 2024 Craftlab Careers</span>
        </footer>
      </div>
    </div>
  );
};

export default HomeFeed;
