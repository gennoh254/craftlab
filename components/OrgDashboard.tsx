
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Target,
  Users,
  Calendar,
  CheckCircle,
  BarChart2,
  Mail,
  XCircle,
  Clock,
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PostCard } from './PostCard';
import { UserRole, Post } from '../types';
import { ViewState } from '../App';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface OrgDashboardProps {
  onNavigate: (view: ViewState) => void;
}

interface DbPost {
  id: string;
  author_id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  visibility: string;
  likes_count: number;
  created_at: string;
  profiles: {
    name: string;
    user_type: string;
    avatar_url: string | null;
  };
}

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  institution: string;
  score: number;
  seeking: string[];
}

const OrgDashboard: React.FC<OrgDashboardProps> = ({ onNavigate }) => {
  const { profile } = useAuth();

  if (!profile || profile.user_type !== 'ORGANIZATION') {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-red-600">Access Denied</h2>
          <p className="text-sm font-semibold text-red-500">This dashboard is only available for organizations.</p>
          <button
            onClick={() => onNavigate('DASHBOARD')}
            className="mt-6 px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [activeMatchTab, setActiveMatchTab] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchFollowCounts();
    fetchMatchedStudents();
  }, []);

  const fetchFollowCounts = async () => {
    if (!user) return;

    const { count: followerCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id);

    const { count: followingCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    setFollowers(followerCount || 0);
    setFollowing(followingCount || 0);
  };

  const fetchMatchedStudents = async () => {
    if (!user || !profile) return;

    setLoadingMatches(true);
    try {
      // First, fetch all opportunities posted by this organization
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('org_id', user.id);

      if (oppError) {
        console.error('Error fetching opportunities:', oppError);
        setLoadingMatches(false);
        return;
      }

      if (!opportunities || opportunities.length === 0) {
        setCandidates([]);
        setLoadingMatches(false);
        return;
      }

      // Extract opportunity IDs
      const opportunityIds = opportunities.map((opp: any) => opp.id);

      // Fetch matches for these opportunities
      const { data: matches, error: matchError } = await supabase
        .from('student_matches')
        .select(`
          id,
          match_score,
          matched_skills,
          student_id,
          opportunity_id,
          reasoning,
          opportunities (
            id,
            role,
            type
          ),
          profiles:student_id (
            id,
            name,
            avatar_url,
            professional_summary,
            skills_detailed
          )
        `)
        .in('opportunity_id', opportunityIds)
        .order('match_score', { ascending: false })
        .limit(10);

      if (matchError) {
        console.error('Error fetching matches:', matchError);
        setLoadingMatches(false);
        return;
      }

      if (matches) {
        const formattedCandidates: Candidate[] = matches.map((match: any) => ({
          id: match.student_id,
          name: match.profiles?.name || 'Unknown',
          avatar: match.student_id,
          institution: match.profiles?.professional_summary?.substring(0, 30) || 'No summary',
          score: match.match_score,
          seeking: match.matched_skills || []
        }));
        setCandidates(formattedCandidates);
      }
    } catch (error) {
      console.error('Error fetching matched students:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          name,
          user_type,
          avatar_url
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      const formattedPosts: Post[] = data.map((post: DbPost) => ({
        id: post.id,
        authorId: post.author_id,
        authorName: post.profiles.name,
        authorAvatar: post.profiles.avatar_url || `https://picsum.photos/seed/${post.author_id}/100`,
        authorRole: post.profiles.user_type === 'STUDENT' ? UserRole.STUDENT : UserRole.ORGANIZATION,
        authorVerified: true,
        type: post.type,
        title: post.title,
        content: post.content,
        tags: post.tags,
        likes: post.likes_count,
        comments: [],
        timestamp: formatTimestamp(post.created_at),
        isPublic: post.visibility === 'public'
      }));
      setPosts(formattedPosts);
    }
    setLoading(false);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Profile & Analytics */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-16 bg-gray-900 relative">
            <div className="absolute -bottom-6 left-4 p-1 bg-white rounded-lg shadow-md">
               <img src="https://picsum.photos/seed/lab/100" className="w-16 h-16 rounded-lg object-cover" alt="Org" />
            </div>
          </div>
          <div className="pt-8 px-4 pb-4 space-y-4">
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-lg font-black text-black tracking-tight">{profile?.name}</h2>
                <CheckCircle className="w-3.5 h-3.5 text-[#facc15]" fill="currentColor" />
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Technology & Research • SF</p>
            </div>
            
            <p className="text-xs text-gray-700 leading-relaxed font-medium italic">
              "Developing next-gen spatial computing platforms."
            </p>

            <div className="flex justify-around items-center gap-4 py-3 border-t border-b border-gray-100">
              <div className="text-center">
                <p className="text-xl font-black text-black">{followers}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-black">{following}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Following</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => onNavigate('EDIT_PROFILE')}
                className="w-full py-2 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
              >
                Manage Profile
              </button>
            </div>
          </div>
        </div>

        {/* Hiring Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-black flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <Calendar className="w-3.5 h-3.5 text-[#facc15]" /> Hiring Calendar
              </h3>
              <Plus className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-black" />
           </div>
           <div className="space-y-3">
              <div className="border-l-4 border-[#facc15] pl-3 py-1">
                <p className="text-[11px] font-black text-black">UX Internship Q3</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase">Ends Aug 15</p>
              </div>
              <div className="border-l-4 border-gray-200 pl-3 py-1">
                <p className="text-[11px] font-black text-gray-400">Graduate Trainee</p>
                <p className="text-[9px] font-bold text-gray-300 uppercase">Opens Sept 1</p>
              </div>
           </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-black text-[#facc15] rounded-xl p-4 space-y-4 shadow-lg">
           <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest">
             <BarChart2 className="w-3.5 h-3.5" /> Pipeline Analytics
           </h3>
           <div className="grid grid-cols-2 gap-4">
             <div className="text-center">
               <p className="text-xl font-black text-white">142</p>
               <p className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Applications</p>
             </div>
             <div className="text-center">
               <p className="text-xl font-black text-white">89%</p>
               <p className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Match Accuracy</p>
             </div>
           </div>
        </div>
      </div>

      {/* CENTER COLUMN: Feed & Opportunity Posting */}
      <div className="lg:col-span-6 space-y-6">
        <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <button 
            onClick={() => onNavigate('CREATE_POST')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 text-black font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-[#facc15] transition-all"
          >
            <Plus className="w-5 h-5" /> Post Feed
          </button>
          <button 
            onClick={() => onNavigate('POST_OPPORTUNITY')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 text-black font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-[#facc15] transition-all"
          >
            <Target className="w-5 h-5" /> Post Role
          </button>
          <button 
            onClick={() => onNavigate('VIEW_MATCHES')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 text-black font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-[#facc15] transition-all"
          >
            <Users className="w-5 h-5" /> Matches
          </button>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Community Feed</span>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-gray-500">No posts in the community feed yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} isOrgView />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Candidate Matches (Limit 10) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-black text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-[#facc15]">Candidate Sync</h3>
            <span className="text-[9px] font-black bg-white/10 px-2 py-0.5 rounded tracking-tighter uppercase">UX INTERN (10 max)</span>
          </div>
          
          <div className="flex border-b border-gray-100 bg-gray-50/50">
             {['All', 'High Sync'].map(tab => (
               <button 
                key={tab} 
                onClick={() => setActiveMatchTab(tab)}
                className={`flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeMatchTab === tab ? 'bg-white border-b-2 border-[#facc15] text-black' : 'text-gray-400'}`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
             {loadingMatches ? (
               <div className="flex items-center justify-center py-8">
                 <Loader2 className="w-6 h-6 text-[#facc15] animate-spin" />
               </div>
             ) : candidates.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">No AI matches found yet</p>
               </div>
             ) : (
               candidates.map((candidate) => (
                 <div key={candidate.id} className="group relative border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all bg-white">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img src={`https://picsum.photos/seed/${candidate.avatar}/50`} className="w-10 h-10 rounded-lg object-cover" alt="Profile" />
                        <div>
                          <p className="text-xs font-black text-black leading-tight">{candidate.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[120px]">{candidate.institution}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-[#facc15]">{candidate.score}%</p>
                      </div>
                   </div>

                   {/* Matched Skills Tags */}
                   <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.seeking.slice(0, 3).map(s => (
                        <span key={s} className="text-[8px] font-black uppercase tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">{s}</span>
                      ))}
                      {candidate.seeking.length > 3 && (
                        <span className="text-[8px] font-black uppercase tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">+{candidate.seeking.length - 3}</span>
                      )}
                   </div>

                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onNavigate('MESSAGES')}
                        className="flex-1 py-1.5 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded shadow-sm hover:scale-105 transition-all"
                      >
                        Invite
                      </button>
                      {/* New Buttons: Shortlist & Reject */}
                      <button className="px-2 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors border border-green-100" title="Shortlist">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button className="px-2 py-1.5 bg-red-50 text-red-400 rounded hover:bg-red-100 transition-colors border border-red-100" title="Reject">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                   </div>
                 </div>
               ))
             )}
          </div>
          
          <button 
            onClick={() => onNavigate('VIEW_MATCHES')}
            className="w-full p-4 text-center text-[10px] font-black text-gray-400 hover:text-black border-t border-gray-100 uppercase tracking-widest bg-gray-50/30"
          >
            View All Candidate Pipeline
          </button>
        </div>

        <div className="bg-black text-white rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#facc15]">
              <Mail className="w-3.5 h-3.5" /> Inbox
            </h3>
            <span className="w-4 h-4 bg-[#facc15] text-black text-[9px] font-black rounded-full flex items-center justify-center">2</span>
          </div>
          <div className="space-y-2">
             <div onClick={() => onNavigate('MESSAGES')} className="flex items-center justify-between text-[10px] font-bold p-2 rounded bg-gray-900 border border-gray-800 cursor-pointer hover:border-[#facc15]/30">
                <span className="truncate pr-2">New: Sarah M. Applied</span>
                <span className="text-[#facc15] shrink-0 text-[8px]">Now</span>
             </div>
             <div onClick={() => onNavigate('MESSAGES')} className="flex items-center justify-between text-[10px] font-bold p-2 rounded bg-gray-900 border border-gray-800 cursor-pointer hover:border-[#facc15]/30">
                <span className="truncate pr-2">Collab: Meta Lab Message</span>
                <span className="text-gray-500 shrink-0 text-[8px]">2h</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrgDashboard;
