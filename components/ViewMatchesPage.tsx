
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { ArrowLeft, Search, Mail, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';

interface ViewMatchesPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const ViewMatchesPage: React.FC<ViewMatchesPageProps> = ({ userRole, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('High Sync');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-black text-black tracking-tight uppercase">
          {userRole === UserRole.STUDENT ? 'Career Alignments' : 'Talent Pipeline'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            {['All', 'High Sync', 'Direct Fit'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                  activeFilter === f ? 'bg-black text-[#facc15] border-black shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Filter pipeline..." className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-black shadow-sm" />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {MOCK_CANDIDATES.map((m, i) => (
            <div key={i} className="p-6 hover:bg-gray-50/20 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <img src={`https://picsum.photos/seed/${m.avatar}/100`} className="w-full h-full object-cover" alt="Match profile" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-black group-hover:text-[#facc15] cursor-pointer transition-colors">
                        {userRole === UserRole.STUDENT ? 'Senior Product Associate' : m.name}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-[#facc15]" fill="currentColor" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {userRole === UserRole.STUDENT ? 'Meta Design Lab • Tech Partner' : m.institution}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black uppercase text-green-500 bg-green-50 px-2 py-0.5 rounded border border-green-100 tracking-tighter">{m.score}% MATCH SYNC</span>
                      <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 tracking-tighter">Full Time</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 md:flex-none px-6 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> {userRole === UserRole.STUDENT ? 'Apply Securely' : 'Invite to Interview'}
                  </button>
                  <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-all shadow-sm">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
          <button className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
            Load Historical Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMatchesPage;
