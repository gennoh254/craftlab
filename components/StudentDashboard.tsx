
import React, { useState, useEffect } from 'react';
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
  Cpu,
  Loader2
} from 'lucide-react';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { MOCK_CERTIFICATES } from '../constants';
import { UserRole, Post } from '../types';
import { ViewState } from '../App';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface StudentDashboardProps {
  onNavigate: (view: ViewState) => void;
  onViewPost?: (post: Post) => void;
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

interface MatchedOpportunity {
  id: string;
  opportunity_id: string;
  student_id: string;
  match_score: number;
  matched_skills: string[];
  analyzed_at: string;
  opportunity?: {
    id: string;
    role: string;
    type: string;
    description: string;
    work_mode: string;
    profiles?: {
      name: string;
      avatar_url: string | null;
    };
  };
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onViewPost }) => {
  const { profile, user } = useAuth();
  const [activeFeedTab, setActiveFeedTab] = useState('Your Posts');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState<MatchedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [matchError, setMatchError] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchFollowCounts();
    fetchMatchedOpportunities();
  }, [activeFeedTab, user]);

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

  const fetchPosts = async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          name,
          user_type,
          avatar_url
        )
      `);

    if (activeFeedTab === 'Your Posts') {
      query = query.eq('author_id', user.id);
    } else {
      query = query.eq('visibility', 'public');
    }

    const { data } = await query.order('created_at', { ascending: false });

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

  const fetchMatchedOpportunities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_matches')
        .select(`
          id,
          opportunity_id,
          student_id,
          match_score,
          matched_skills,
          analyzed_at,
          opportunities:opportunity_id (
            id,
            role,
            type,
            description,
            work_mode,
            profiles:org_id (
              name,
              avatar_url
            )
          )
        `)
        .eq('student_id', user.id)
        .order('match_score', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      if (data) {
        setMatchedOpportunities(data as any);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMatchedOpportunities();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleRunMatching = async () => {
    if (!user) return;

    setMatchLoading(true);
    setMatchError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/match_student_to_opportunities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ studentId: user.id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMatchError(result.message || result.error || 'Failed to run AI matching');
        setMatchLoading(false);
        return;
      }

      await fetchMatchedOpportunities();
    } catch (err: any) {
      setMatchError(err.message || 'Error running AI matching');
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: Profile + CV Builder Badge */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-24 bg-black relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-[1.5rem] shadow-2xl">
               <img
                 src={profile?.avatar_url || `https://picsum.photos/seed/${user?.id || 'student'}/150`}
                 className="w-24 h-24 rounded-[1.2rem] object-cover"
                 alt="Student"
               />
            </div>
            <div className="absolute top-3 right-3 bg-[#facc15] text-black text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Check className="w-3 h-3" /> CV Ready
            </div>
          </div>
          <div className="pt-14 px-6 pb-8 space-y-6 text-center">
            <div>
              <h2 className="text-3xl font-black text-black tracking-tighter leading-none">{profile?.name || 'Student'}</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">
                {profile?.user_type === 'STUDENT' ? 'Student' : 'Organization'}
              </p>
            </div>

            {profile?.professional_summary && (
              <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                "{profile.professional_summary.substring(0, 120)}{profile.professional_summary.length > 120 ? '...' : ''}"
              </p>
            )}

            <div className="flex justify-around items-center gap-4 pt-4 pb-4 border-b border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-black text-black">{followers}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-black">{following}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Following</p>
              </div>
            </div>

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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-sm font-bold text-gray-500">
                {activeFeedTab === 'Your Posts'
                  ? 'No posts yet. Share your first update!'
                  : 'No community posts available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map(post => (
                <PostCard key={post.id} post={post} onViewPost={onViewPost} />
              ))}
            </div>
          )}
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

          <div className="space-y-4">
            <div className="space-y-3">
              {matchError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                  <p className="text-[9px] text-red-400 font-bold">{matchError}</p>
                </div>
              )}

              <button
                onClick={handleRunMatching}
                disabled={matchLoading}
                className="w-full py-4 bg-[#facc15] text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {matchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" /> Run AI Analysis
                  </>
                )}
              </button>
            </div>

            {matchedOpportunities.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-[10px] font-black text-[#facc15] uppercase tracking-widest">
                  Top Matches
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {matchedOpportunities.map(match => (
                    <div key={match.id} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-white truncate">{match.opportunity?.role}</p>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest">{match.opportunity?.type}</p>
                        </div>
                        <span className="ml-2 text-[10px] font-black text-[#facc15]">{match.match_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigate('ALL_OPPORTUNITIES')}
              className="w-full py-3 bg-white/10 text-[#facc15] font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20"
            >
              View All Opportunities
            </button>
          </div>
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
