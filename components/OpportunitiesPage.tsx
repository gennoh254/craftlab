
import React, { useState, useEffect } from 'react';
import { UserRole, DbOpportunity } from '../types';
import { ViewState } from '../App';
import {
  ArrowLeft,
  Search,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  Filter,
  CheckCircle,
  Building,
  Zap,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface OpportunitiesPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

interface AIRecommendation {
  id: string;
  role: string;
  orgName: string;
  matchScore: number;
  reason: string;
}

const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ userRole, onNavigate }) => {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<DbOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<DbOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedOpportunities, setAppliedOpportunities] = useState<Set<string>>(new Set());

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState('');

  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    if (user && userRole === UserRole.STUDENT) {
      fetchUserApplications();
      fetchAiRecommendations();
    }
  }, [user, userRole]);

  useEffect(() => {
    applyFilters();
  }, [opportunities, searchKeyword, selectedTypes, dateFilter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('opportunities')
      .select(`
        *,
        profiles:org_id (
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setOpportunities(data);
      setFilteredOpportunities(data);
    }
    setLoading(false);
  };

  const fetchUserApplications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('student_id', user.id);

    if (data) {
      setAppliedOpportunities(new Set(data.map(app => app.opportunity_id)));
    }
  };

  const fetchAiRecommendations = async () => {
    if (!user) return;
    setLoadingRecommendations(true);

    const { data } = await supabase
      .from('student_matches')
      .select(`
        id,
        match_score,
        reasoning,
        opportunities:opportunity_id (
          role,
          profiles:org_id (
            name
          )
        )
      `)
      .eq('student_id', user.id)
      .order('match_score', { ascending: false })
      .limit(5);

    if (data) {
      const recommendations = data.map((match: any) => ({
        id: match.id,
        role: match.opportunities?.role || 'Unknown Role',
        orgName: match.opportunities?.profiles?.name || 'Organization',
        matchScore: match.match_score,
        reason: match.reasoning
      }));
      setAiRecommendations(recommendations);
    }
    setLoadingRecommendations(false);
  };

  const applyFilters = () => {
    let filtered = opportunities;

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.role.toLowerCase().includes(keyword) ||
        opp.description?.toLowerCase().includes(keyword) ||
        opp.skills_required?.toLowerCase().includes(keyword) ||
        opp.profiles?.name?.toLowerCase().includes(keyword)
      );
    }

    if (selectedTypes.size > 0) {
      filtered = filtered.filter(opp => selectedTypes.has(opp.type));
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(opp => {
        if (!opp.start_date) return true;
        const startDate = new Date(opp.start_date);
        return startDate >= filterDate;
      });
    }

    setFilteredOpportunities(filtered);
  };

  const toggleTypeFilter = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const clearAllFilters = () => {
    setSearchKeyword('');
    setSelectedTypes(new Set());
    setDateFilter('');
  };

  const handleApply = async (opportunityId: string, orgId: string) => {
    if (!user) return;

    setApplying(opportunityId);
    const { error } = await supabase
      .from('applications')
      .insert([
        {
          student_id: user.id,
          opportunity_id: opportunityId,
          org_id: orgId,
          status: 'pending'
        }
      ]);

    if (!error) {
      setAppliedOpportunities(prev => new Set([...prev, opportunityId]));
    }
    setApplying(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isStudent = userRole === UserRole.STUDENT;
  const isOrganization = userRole === UserRole.ORGANIZATION;

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
      </div>

      {isStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTERS SIDEBAR - STUDENT ONLY */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#facc15]" /> Filtering
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-[9px] font-bold text-gray-400 uppercase hover:text-black transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Design, AI, Remote..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opportunity Type</label>
                  <div className="space-y-2">
                    {['Internship', 'Attachment', 'Apprenticeship', 'Volunteer'].map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTypes.has(type)}
                          onChange={() => toggleTypeFilter(type)}
                          className="w-4 h-4 rounded text-black border-gray-300 focus:ring-0"
                        />
                        <span className="text-[11px] font-bold text-gray-500 group-hover:text-black transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date From</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={applyFilters}
                    className="w-full py-2 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* AI RECOMMENDATIONS - STUDENT ONLY */}
            {aiRecommendations.length > 0 && (
              <div className="bg-black text-white rounded-2xl p-6 shadow-2xl border border-white/10 space-y-4">
                <h3 className="text-[10px] font-black text-[#facc15] uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4" /> AI Recommendations
                </h3>

                {loadingRecommendations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-[#facc15] animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                      We found <span className="text-white font-bold">{aiRecommendations.length} new roles</span> that match your profile.
                    </p>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {aiRecommendations.map((rec) => (
                        <div key={rec.id} className="bg-white/10 border border-white/20 rounded-lg p-3 hover:bg-white/20 transition-all">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-white uppercase truncate">{rec.role}</p>
                              <p className="text-[9px] text-gray-400 truncate">{rec.orgName}</p>
                            </div>
                            <span className="text-xs font-black text-[#facc15] shrink-0">{rec.matchScore}%</span>
                          </div>
                          <p className="text-[8px] text-gray-400 line-clamp-2">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* MAIN LIST - STUDENT */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-black mb-2">No Opportunities Match Your Filters</h3>
                <p className="text-sm text-gray-500 font-medium">Try adjusting your search criteria to find more opportunities.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Showing {filteredOpportunities.length} of {opportunities.length} opportunities
                </p>
                {filteredOpportunities.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                        {opp.profiles?.avatar_url ? (
                          <img src={opp.profiles.avatar_url} alt={opp.profiles.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-black text-black tracking-tight group-hover:text-[#facc15] transition-colors">{opp.role}</h3>
                              <CheckCircle className="w-4 h-4 text-[#facc15]" fill="currentColor" />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                              <span className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" /> {opp.profiles?.name || 'Organization'}
                              </span>
                              {opp.work_mode && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" /> {opp.work_mode}
                                </span>
                              )}
                              {opp.hours_per_week && (
                                <span className="flex items-center gap-1.5 text-black font-black">
                                  <Clock className="w-3.5 h-3.5" /> {opp.hours_per_week}h/Week
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-2">
                          {opp.description}
                        </p>

                        {opp.skills_required && (
                          <div className="flex flex-wrap gap-2">
                            {opp.skills_required.split(',').map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-[#facc15]/10 text-[#facc15] text-[9px] font-black uppercase rounded-lg">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-200">
                              {opp.type}
                            </span>
                            {opp.start_date && (
                              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-200">
                                Starts: {formatDate(opp.start_date)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApply(opp.id, opp.org_id)}
                              disabled={appliedOpportunities.has(opp.id) || applying === opp.id}
                              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md ${
                                appliedOpportunities.has(opp.id)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-black text-[#facc15] hover:scale-105 active:scale-95'
                              }`}
                            >
                              {applying === opp.id ? 'Applying...' : appliedOpportunities.has(opp.id) ? 'Applied' : 'Apply Now'}
                            </button>
                            <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ORGANIZATION VIEW - NO FILTERS OR AI RECOMMENDATIONS
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-black mb-2">No Opportunities Yet</h3>
              <p className="text-sm text-gray-500 font-medium">Post opportunities from your dashboard to start recruiting.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-black tracking-tight group-hover:text-[#facc15] transition-colors mb-2 truncate">
                          {opp.role}
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                          {opp.type}
                        </p>
                      </div>
                      <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 py-3 border-t border-b border-gray-100">
                      {opp.work_mode && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                          <MapPin className="w-3.5 h-3.5" /> {opp.work_mode}
                        </span>
                      )}
                      {opp.hours_per_week && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                          <Clock className="w-3.5 h-3.5" /> {opp.hours_per_week}h/Week
                        </span>
                      )}
                      {opp.start_date && (
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          Starts: {formatDate(opp.start_date)}
                        </span>
                      )}
                    </div>

                    {opp.skills_required && (
                      <div className="flex flex-wrap gap-1">
                        {opp.skills_required.split(',').slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#facc15]/10 text-[#facc15] text-[8px] font-black uppercase rounded-md">
                            {skill.trim()}
                          </span>
                        ))}
                        {opp.skills_required.split(',').length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[8px] font-black uppercase rounded-md">
                            +{opp.skills_required.split(',').length - 3}
                          </span>
                        )}
                      </div>
                    )}
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

export default OpportunitiesPage;
