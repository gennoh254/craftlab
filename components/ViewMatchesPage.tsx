
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { ArrowLeft, Search, Mail, CheckCircle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface ViewMatchesPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

interface ApplicationWithDetails {
  id: string;
  status: string;
  created_at: string;
  student_id: string;
  opportunity_id: string;
  opportunity?: {
    role: string;
  };
  student?: {
    name: string;
    avatar_url: string | null;
  };
}

const ViewMatchesPage: React.FC<ViewMatchesPageProps> = ({ userRole, onNavigate }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userRole === UserRole.ORGANIZATION && user) {
      fetchApplications();
    }
  }, [user, userRole]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        student_id,
        opportunity_id,
        opportunities:opportunity_id (
          role
        ),
        profiles:student_id (
          name,
          avatar_url
        )
      `)
      .eq('org_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formattedData = data.map((app: any) => ({
        id: app.id,
        status: app.status,
        created_at: app.created_at,
        student_id: app.student_id,
        opportunity_id: app.opportunity_id,
        opportunity: app.opportunities,
        student: app.profiles
      }));
      setApplications(formattedData);
    }
    setLoading(false);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (!error) {
      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
    }
  };

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
            {['All', 'pending', 'shortlisted', 'rejected'].map(f => (
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
            <button onClick={() => fetchApplications()} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
          </div>
        ) : userRole === UserRole.ORGANIZATION ? (
          applications.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-black mb-2">No Applications Yet</h3>
              <p className="text-sm text-gray-500 font-medium">Applications from students will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50/20 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={`https://picsum.photos/seed/${app.student_id}/100`} className="w-full h-full object-cover" alt="Applicant" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-black group-hover:text-[#facc15] cursor-pointer transition-colors">
                            {app.student?.name}
                          </h3>
                          <CheckCircle className="w-4 h-4 text-[#facc15]" fill="currentColor" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {app.opportunity?.role}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-tighter ${
                            app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            app.status === 'shortlisted' ? 'bg-green-50 text-green-600 border-green-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'shortlisted')}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all shadow-md active:scale-95"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-all shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
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
                          Senior Product Associate
                        </h3>
                        <CheckCircle className="w-4 h-4 text-[#facc15]" fill="currentColor" />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Meta Design Lab • Tech Partner
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-black uppercase text-green-500 bg-green-50 px-2 py-0.5 rounded border border-green-100 tracking-tighter">{m.score}% MATCH SYNC</span>
                        <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 tracking-tighter">Full Time</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex-1 md:flex-none px-6 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Apply Securely
                    </button>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-all shadow-sm">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {applications.length > 0 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
            <button className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
              Load Historical Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMatchesPage;
