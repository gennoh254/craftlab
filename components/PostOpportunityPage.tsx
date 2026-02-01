
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { ArrowLeft, Target, Briefcase, Calendar, Clock, MapPin, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface PostOpportunityPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const PostOpportunityPage: React.FC<PostOpportunityPageProps> = ({ userRole, onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: '',
    type: 'Internship' as 'Internship' | 'Attachment' | 'Apprenticeship' | 'Volunteer',
    description: '',
    skills_required: '',
    start_date: '',
    work_mode: 'Remote' as 'Remote' | 'On-site' | 'Hybrid',
    hours_per_week: ''
  });

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.role || !formData.description) {
      setError('Role title and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('opportunities')
        .insert({
          org_id: user.id,
          role: formData.role,
          type: formData.type,
          description: formData.description,
          skills_required: formData.skills_required,
          start_date: formData.start_date || null,
          work_mode: formData.work_mode,
          hours_per_week: formData.hours_per_week ? parseInt(formData.hours_per_week) : null
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        onNavigate('DASHBOARD');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
                  <input
                    type="text"
                    placeholder="e.g. UX Designer Intern"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black appearance-none cursor-pointer font-semibold"
                  >
                    <option>Internship</option>
                    <option>Attachment</option>
                    <option>Volunteer</option>
                    <option>Apprenticeship</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Description</label>
                <textarea
                  rows={4}
                  placeholder="What will this talent accomplish?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none font-semibold"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                <Zap className="w-4 h-4 text-[#facc15]" /> Requirements
              </h2>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Target Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React, Figma, SQL"
                  value={formData.skills_required}
                  onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                <Calendar className="w-4 h-4 text-[#facc15]" /> Logistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Commencement</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Work Mode</label>
                  <select
                    value={formData.work_mode}
                    onChange={(e) => setFormData({ ...formData, work_mode: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black appearance-none cursor-pointer font-semibold"
                  >
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Hours Per Week</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={formData.hours_per_week}
                  onChange={(e) => setFormData({ ...formData, hours_per_week: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black font-semibold"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
               <button
                 onClick={() => onNavigate('DASHBOARD')}
                 disabled={loading}
                 className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors disabled:opacity-50"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSubmit}
                 disabled={loading}
                 className="px-10 py-3 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 {loading ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Publishing...
                   </>
                 ) : (
                   'Publish Role'
                 )}
               </button>
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
