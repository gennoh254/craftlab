
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import {
  ArrowLeft,
  Search,
  Mail,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Zap,
  AlertCircle,
  TrendingUp,
  Target
} from 'lucide-react';
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

interface Match {
  id: string;
  opportunity_id: string;
  match_score: number;
  matched_skills: string[];
  reasoning: string;
  opportunity?: {
    role: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  };
}

interface AIMatch {
  id: string;
  opportunity_id: string;
  student_id: string;
  match_score: number;
  matched_skills: string[];
  reasoning: string;
  analyzed_at: string;
  student?: {
    name: string;
    avatar_url: string | null;
  };
  opportunity?: {
    role: string;
  };
}

interface MatchError {
  error: string;
  message: string;
  completionPercentage: number;
  requiredFields: Record<string, boolean>;
}

const ViewMatchesPage: React.FC<ViewMatchesPageProps> = ({ userRole, onNavigate }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState(userRole === UserRole.STUDENT ? 'ANALYSIS' : 'APPLICATIONS');
  const [activeFilter, setActiveFilter] = useState('All');
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [aiMatches, setAiMatches] = useState<AIMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAiMatches, setLoadingAiMatches] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<MatchError | null>(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  useEffect(() => {
    if (userRole === UserRole.ORGANIZATION && user) {
      fetchApplications();
      fetchAiMatches();
    } else if (userRole === UserRole.STUDENT && user) {
      fetchMatches();
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

  const fetchAiMatches = async () => {
    if (!user) return;
    setLoadingAiMatches(true);

    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('id')
      .eq('org_id', user.id);

    if (!opportunities || opportunities.length === 0) {
      setLoadingAiMatches(false);
      return;
    }

    const opportunityIds = opportunities.map((opp: any) => opp.id);

    const { data } = await supabase
      .from('student_matches')
      .select(`
        id,
        opportunity_id,
        student_id,
        match_score,
        matched_skills,
        reasoning,
        analyzed_at,
        profiles:student_id (
          name,
          avatar_url
        ),
        opportunities:opportunity_id (
          role
        )
      `)
      .in('opportunity_id', opportunityIds)
      .order('match_score', { ascending: false });

    if (data) {
      const formattedData = data.map((match: any) => ({
        id: match.id,
        opportunity_id: match.opportunity_id,
        student_id: match.student_id,
        match_score: match.match_score,
        matched_skills: match.matched_skills || [],
        reasoning: match.reasoning,
        analyzed_at: match.analyzed_at,
        student: match.profiles,
        opportunity: match.opportunities
      }));
      setAiMatches(formattedData);
    }
    setLoadingAiMatches(false);
  };

  const fetchMatches = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('student_matches')
      .select(`
        *,
        opportunities:opportunity_id (
          role,
          profiles:org_id (
            name,
            avatar_url
          )
        )
      `)
      .eq('student_id', user.id)
      .order('match_score', { ascending: false })
      .limit(10);

    if (data) {
      setMatches(data as any);
    }
    setLoading(false);
  };

  const runMatchingAnalysis = async () => {
    if (!user) return;

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSuccess(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/match_student_to_opportunities`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId: user.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAnalysisError(data);
      } else {
        setAnalysisSuccess(true);
        setTimeout(() => {
          fetchMatches();
          setAnalysisSuccess(false);
        }, 1500);
      }
    } catch (err: any) {
      setAnalysisError({
        error: 'Analysis Failed',
        message: err.message,
        completionPercentage: 0,
        requiredFields: {},
      });
    } finally {
      setAnalyzing(false);
    }
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
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-black text-black tracking-tight uppercase">
          {userRole === UserRole.STUDENT ? 'My Top Matches' : 'Talent Pipeline'}
        </h1>
      </div>

      {userRole === UserRole.STUDENT && (
        <AnalysisSection
          analyzing={analyzing}
          analysisError={analysisError}
          analysisSuccess={analysisSuccess}
          profile={profile}
          onRunAnalysis={runMatchingAnalysis}
          onEditProfile={() => onNavigate('EDIT_PROFILE')}
          matches={matches}
          loading={loading}
          onApply={() => onNavigate('OPPORTUNITIES')}
        />
      )}

      {userRole === UserRole.STUDENT ? (
        <div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CURRENT APPLICANTS SECTION */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#facc15]" /> Current Applicants
                </h2>
                <span className="text-sm font-black text-[#facc15] bg-black px-3 py-1 rounded-lg">
                  {applications.length}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'pending', 'shortlisted', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      activeFilter === f ? 'bg-black text-[#facc15] border-black' : 'bg-white text-gray-400 border-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-black text-black mb-2">No Applications Yet</h3>
                  <p className="text-xs text-gray-500 font-medium">Applications from students will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 hover:bg-gray-50/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <img src={`https://picsum.photos/seed/${app.student_id}/100`} className="w-full h-full object-cover" alt="Applicant" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-black truncate">
                                {app.student?.name}
                              </h3>
                              <CheckCircle className="w-3.5 h-3.5 text-[#facc15] shrink-0" fill="currentColor" />
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                              {app.opportunity?.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-tighter ${
                            app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            app.status === 'shortlisted' ? 'bg-green-50 text-green-600 border-green-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {app.status === 'pending' && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStatusChange(app.id, 'shortlisted')}
                              className="flex-1 px-3 py-1.5 bg-black text-[#facc15] text-[8px] font-black uppercase tracking-widest rounded hover:scale-105 transition-all shadow-sm"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-[8px] font-black uppercase tracking-widest rounded hover:scale-105 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => fetchApplications()}
              className="w-full p-3 text-center text-[9px] font-black text-gray-400 hover:text-black border-t border-gray-100 uppercase tracking-widest bg-gray-50/30 transition-colors"
            >
              Refresh Applicants
            </button>
          </div>

          {/* AI MATCHED STUDENTS SECTION */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#facc15]" /> AI Matched Students
                </h2>
                <span className="text-sm font-black text-[#facc15] bg-black px-3 py-1 rounded-lg">
                  {aiMatches.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {loadingAiMatches ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
                </div>
              ) : aiMatches.length === 0 ? (
                <div className="p-12 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-black text-black mb-2">No AI Matches Yet</h3>
                  <p className="text-xs text-gray-500 font-medium">AI-generated matches will appear here when students run analysis.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {aiMatches.map((match) => (
                    <div key={match.id} className="p-4 hover:bg-gray-50/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <img src={`https://picsum.photos/seed/${match.student_id}/100`} className="w-full h-full object-cover" alt="Match" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 justify-between">
                              <h3 className="text-sm font-black text-black truncate">
                                {match.student?.name}
                              </h3>
                              <span className="text-xs font-black text-[#facc15] shrink-0">
                                {match.match_score}%
                              </span>
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                              {match.opportunity?.role}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 font-medium leading-snug">
                          {match.reasoning}
                        </p>

                        {match.matched_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {match.matched_skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-[#facc15]/10 text-[#facc15] text-[8px] font-black uppercase rounded-md">
                                {skill}
                              </span>
                            ))}
                            {match.matched_skills.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-black uppercase rounded-md">
                                +{match.matched_skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex-1 px-3 py-1.5 bg-black text-[#facc15] text-[8px] font-black uppercase tracking-widest rounded hover:scale-105 transition-all shadow-sm">
                            Invite
                          </button>
                          <button className="px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors border border-green-100">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => fetchAiMatches()}
              className="w-full p-3 text-center text-[9px] font-black text-gray-400 hover:text-black border-t border-gray-100 uppercase tracking-widest bg-gray-50/30 transition-colors"
            >
              Refresh Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalysisSection: React.FC<{
  analyzing: boolean;
  analysisError: MatchError | null;
  analysisSuccess: boolean;
  profile: any;
  onRunAnalysis: () => void;
  onEditProfile: () => void;
  matches: Match[];
  loading: boolean;
  onApply: () => void;
}> = ({ analyzing, analysisError, analysisSuccess, profile, onRunAnalysis, onEditProfile, matches, loading, onApply }) => {
  const completionFields = [
    { name: 'Skills', complete: !!profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 },
    { name: 'Professional Summary', complete: !!profile?.professional_summary && profile.professional_summary.length > 50 },
    { name: 'Education', complete: !!profile?.education && Array.isArray(profile.education) && profile.education.length > 0 },
    { name: 'Contact Email', complete: !!profile?.contact_email },
    { name: 'Phone Number', complete: !!profile?.contact_phone },
    { name: 'Address', complete: !!profile?.address },
  ];

  const completionPercentage = Math.round((completionFields.filter(f => f.complete).length / completionFields.length) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tight flex items-center gap-3">
              <Target className="w-8 h-8 text-[#facc15]" /> Run Matching Analysis
            </h2>
            <p className="text-gray-600 font-medium">Our AI engine analyzes your profile against active opportunities to find your perfect matches.</p>
          </div>
          <button
            onClick={onRunAnalysis}
            disabled={analyzing || completionPercentage < 50}
            className={`px-8 py-6 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all shadow-xl ${
              completionPercentage < 50
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-black text-[#facc15] hover:scale-105 active:scale-95'
            }`}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> {completionPercentage === 100 ? 'Run Analysis' : 'Complete Profile'}
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Completion</span>
            <span className="text-lg font-black text-black">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#facc15] to-yellow-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            {completionFields.map((field) => (
              <div key={field.name} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                field.complete
                  ? 'bg-green-50 border-green-100'
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  field.complete ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {field.complete && <CheckCircle className="w-3 h-3 text-white" fill="white" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  field.complete ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {field.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {completionPercentage < 50 && (
          <div className="p-6 bg-yellow-50 border-2 border-yellow-100 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-black text-yellow-900 uppercase">Profile Needs Completion</h3>
              <p className="text-xs text-yellow-800 font-medium">
                You need to complete at least 50% of your profile before running the matching analysis. This helps our AI engine find the best opportunities for you.
              </p>
              <button
                onClick={onEditProfile}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-700 transition-all"
              >
                Go to Edit Profile
              </button>
            </div>
          </div>
        )}

        {analysisError && (
          <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-red-900 uppercase">{analysisError.error}</h3>
                <p className="text-xs text-red-800 font-medium mt-1">{analysisError.message}</p>
              </div>
            </div>
            {analysisError.completionPercentage < 50 && (
              <button
                onClick={onEditProfile}
                className="w-full px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all"
              >
                Complete Your Profile Now
              </button>
            )}
          </div>
        )}

        {analysisSuccess && (
          <div className="p-6 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" fill="currentColor" />
            <span className="text-sm font-black text-green-900 uppercase">Analysis Complete! Check your matches below.</span>
          </div>
        )}
      </div>

      {matches.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#facc15]" />
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">Top Matches ({matches.length})</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1 truncate">
                          {match.opportunity?.role}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {match.opportunity?.profiles?.name}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-3xl font-black text-[#facc15]">{match.match_score}%</div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Match</p>
                      </div>
                    </div>

                    {match.matched_skills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matched Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {match.matched_skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="text-[9px] font-black bg-[#facc15]/10 text-[#facc15] px-3 py-1 rounded-lg border border-[#facc15]/30 uppercase">
                              {skill}
                            </span>
                          ))}
                          {match.matched_skills.length > 3 && (
                            <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-3 py-1 rounded-lg border border-gray-200 uppercase">
                              +{match.matched_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-700 font-medium">{match.reasoning}</p>

                    <button
                      onClick={onApply}
                      className="w-full py-3 bg-black text-[#facc15] font-black rounded-lg text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                    >
                      View Opportunities
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultsSection: React.FC<{
  matches: Match[];
  loading: boolean;
  onApply: () => void;
}> = ({ matches, loading, onApply }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center space-y-4">
        <Target className="w-12 h-12 text-gray-300 mx-auto" />
        <h3 className="text-lg font-black text-black">No Matches Found</h3>
        <p className="text-sm text-gray-500 font-medium">
          Run an analysis to see opportunities matched to your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={`https://picsum.photos/seed/${match.opportunity_id}/100`}
                  className="w-full h-full object-cover"
                  alt="Opportunity"
                />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-lg font-black text-black group-hover:text-[#facc15] transition-colors">
                    {match.opportunity?.role}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    {match.opportunity?.profiles?.name}
                  </p>
                </div>
                <p className="text-xs text-gray-600 font-medium">{match.reasoning}</p>
                {match.matched_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {match.matched_skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#facc15]/10 text-[#facc15] text-[9px] font-black uppercase rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {match.matched_skills.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[9px] font-black uppercase rounded-lg">
                        +{match.matched_skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#facc15]">{match.match_score}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">% Match</span>
              </div>
              <button
                onClick={onApply}
                className="px-6 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewMatchesPage;
