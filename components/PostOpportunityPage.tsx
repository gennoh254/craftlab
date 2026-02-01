
import React from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { ArrowLeft, Target, Briefcase, Calendar, Clock, MapPin, Zap, CheckCircle } from 'lucide-react';

interface PostOpportunityPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const PostOpportunityPage: React.FC<PostOpportunityPageProps> = ({ userRole, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <h1 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
          <Target className="w-6 h-6 text-[#facc15]" /> Post New Role
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                <Briefcase className="w-4 h-4 text-[#facc15]" /> Core Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Role Title</label>
                  <input type="text" placeholder="e.g. UX Designer Intern" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Type</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black appearance-none cursor-pointer font-semibold">
                    <option>Internship</option>
                    <option>Attachment</option>
                    <option>Volunteer</option>
                    <option>Apprenticeship</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Description</label>
                <textarea rows={4} placeholder="What will this talent accomplish?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none font-semibold" />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                <Zap className="w-4 h-4 text-[#facc15]" /> Requirements
              </h2>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Target Skills</label>
                <input type="text" placeholder="e.g. React, Figma, SQL" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold" />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                <Calendar className="w-4 h-4 text-[#facc15]" /> Logistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Commencement</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Work Mode</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black appearance-none cursor-pointer font-semibold">
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
               <button onClick={() => onNavigate('DASHBOARD')} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Cancel</button>
               <button onClick={() => onNavigate('DASHBOARD')} className="px-10 py-3 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95">Publish Role</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-black text-white rounded-2xl p-6 shadow-2xl space-y-6 border border-white/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#facc15]">
              <CheckCircle className="w-4 h-4" /> Visibility Settings
            </h3>
            <div className="space-y-4">
              {['Show on global feed', 'Send notification to top matches', 'Allow candidate messages'].map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-black bg-gray-800 border-gray-700" />
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostOpportunityPage;
