
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { 
  ArrowLeft, 
  Search, 
  Briefcase, 
  Target, 
  MapPin, 
  Clock, 
  ExternalLink,
  Filter,
  CheckCircle,
  Building,
  Zap
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../constants';

interface OpportunitiesPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ userRole, onNavigate }) => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <button 
            onClick={() => onNavigate('HOME')}
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Feed
          </button>
          <h1 className="text-4xl font-black text-black tracking-tighter flex items-center gap-4">
            <Briefcase className="w-10 h-10 text-[#facc15]" /> DIRECT OPPORTUNITIES
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-2">Connecting talent with high-impact organizations across the Craftlab network.</p>
        </div>

        <div className="flex items-center gap-2">
           <button className="px-6 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-2">
             <Target className="w-4 h-4" /> My Top Matches
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#facc15]" /> Filtering
              </h3>
              <button className="text-[9px] font-bold text-gray-400 uppercase">Clear All</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Design, AI, Remote..." className="w-full bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-xs font-bold focus:border-black transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opportunity Type</label>
                <div className="space-y-2">
                  {['Internship', 'Attachment', 'Apprenticeship', 'Volunteer'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded text-black border-gray-300 focus:ring-0" />
                      <span className="text-[11px] font-bold text-gray-500 group-hover:text-black transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button className="w-full py-2 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors">Apply Filters</button>
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-2xl p-6 shadow-2xl border border-white/10 space-y-4">
             <h3 className="text-[10px] font-black text-[#facc15] uppercase tracking-widest flex items-center gap-2">
               <Zap className="w-4 h-4" /> AI Recommendations
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
               Our engine has detected <span className="text-white font-bold">4 new roles</span> that perfectly align with your current certificate profile.
             </p>
             <button className="w-full py-2 border border-[#facc15]/30 text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#facc15]/10 transition-colors">View AI Suggestions</button>
          </div>
        </aside>

        {/* Main List */}
        <div className="lg:col-span-3 space-y-6">
          {MOCK_OPPORTUNITIES.map((opp, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all group">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                   <Building className="w-8 h-8 text-gray-300" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-black tracking-tight group-hover:text-[#facc15] transition-colors">{opp.role}</h3>
                        <CheckCircle className="w-4 h-4 text-[#facc15]" fill="currentColor" />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {opp.orgName}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Remote / Hybrid</span>
                        <span className="flex items-center gap-1.5 text-black font-black"><Clock className="w-3.5 h-3.5" /> {opp.hoursPerWeek}h/Week</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-100">{opp.matchScore}% Match Sync</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-2">
                    Join our award-winning team to help define the next generation of spatial user interfaces. You'll work closely with senior mentors to build production-ready prototypes.
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-200">{opp.type}</span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-200">Timeline: {opp.timeline}</span>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-md active:scale-95">Apply Now</button>
                      <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"><ExternalLink className="w-4 h-4 text-gray-400" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center py-10">
             <button className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors">Load More Opportunities</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
