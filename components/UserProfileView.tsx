import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserPlus, UserCheck, FileText, Loader as Loader2, Mail, MapPin, Link as LinkIcon, Zap, Sparkles, Briefcase, Cpu, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Post, UserRole } from '../types';
import { PostCard } from './PostCard';

interface UserProfileViewProps {
  userId: string;
  onNavigate: (view: string, userId?: string) => void;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: 'STUDENT' | 'ORGANIZATION';
  professional_summary: string | null;
  email: string | null;
  location: string | null;
  website_url: string | null;
  created_at: string;
}

interface ProfileStats {
  followers: number;
  following: number;
  postsCount: number;
}

interface AIRecommendation {
  id: string;
  role: string;
  orgName: string;
  orgAvatarUrl: string | null;
  matchScore: number;
  reason: string;
  type: string;
  workMode: string;
  matchedSkills: string[];
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ userId, onNavigate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ followers: 0, following: 0, postsCount: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'followers' | 'following' | 'recommendations'>('posts');
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes, followCheckRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, avatar_url, user_type, professional_summary, email, location, website_url, created_at')
          .eq('id', userId)
          .maybeSingle(),

        supabase
          .from('posts')
          .select('id, title, content, author_id, type, tags, visibility, media_url, media_type, likes_count, created_at, profiles:author_id(name, avatar_url, user_type)')
          .eq('author_id', userId)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false }),

        user ? supabase
          .from('connections')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle() : Promise.resolve({ data: null })
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      if (postsRes.data) {
        const formattedPosts: Post[] = postsRes.data.map((post: any) => ({
          id: post.id,
          authorId: post.author_id,
          authorName: post.profiles?.name || 'Unknown',
          authorAvatar: post.profiles?.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="50" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3E?%3C/text%3E%3C/svg%3E',
          authorRole: post.profiles?.user_type === 'STUDENT' ? UserRole.STUDENT : UserRole.ORGANIZATION,
          authorVerified: true,
          type: post.type,
          title: post.title,
          content: post.content,
          tags: post.tags || [],
          likes: post.likes_count || 0,
          comments: [],
          timestamp: formatTimestamp(post.created_at),
          isPublic: true,
          mediaUrl: post.media_url || undefined,
          mediaType: (post.media_type as 'image' | 'video' | 'file') || undefined
        }));
        setPosts(formattedPosts);
      }

      setIsFollowing(!!followCheckRes.data);

      await fetchStats(userId);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (targetUserId: string) => {
    try {
      const [followersRes, followingRes, postsCountRes] = await Promise.all([
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', targetUserId),

        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', targetUserId),

        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', targetUserId)
          .eq('visibility', 'public')
      ]);

      setStats({
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
        postsCount: postsCountRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFollowersList = async () => {
    try {
      const { data } = await supabase
        .from('connections')
        .select('follower_id, profiles!connections_follower_id_fkey(id, name, avatar_url, user_type)')
        .eq('following_id', userId);

      if (data) {
        const profiles = data.map(item => item.profiles).filter(Boolean);
        setFollowers(profiles);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowingList = async () => {
    try {
      const { data } = await supabase
        .from('connections')
        .select('following_id, profiles!connections_following_id_fkey(id, name, avatar_url, user_type)')
        .eq('follower_id', userId);

      if (data) {
        const profiles = data.map(item => item.profiles).filter(Boolean);
        setFollowing(profiles);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await supabase
          .from('connections')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
      } else {
        await supabase
          .from('connections')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
      }

      setIsFollowing(!isFollowing);
      await fetchStats(userId);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleTabChange = async (tab: typeof selectedTab) => {
    setSelectedTab(tab);
    if (tab === 'followers' && followers.length === 0) {
      await fetchFollowersList();
    } else if (tab === 'following' && following.length === 0) {
      await fetchFollowingList();
    } else if (tab === 'recommendations' && aiRecommendations.length === 0) {
      await fetchAiRecommendations();
    }
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

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('posts').delete().eq('id', postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const fetchAiRecommendations = async () => {
    setLoadingRecommendations(true);
    const { data } = await supabase
      .from('student_matches')
      .select(`
        id,
        match_score,
        reasoning,
        matched_skills,
        opportunities:opportunity_id (
          role,
          type,
          work_mode,
          profiles:org_id (
            name,
            avatar_url
          )
        )
      `)
      .eq('student_id', userId)
      .order('match_score', { ascending: false })
      .limit(5);

    if (data) {
      const recommendations = data.map((match: any) => ({
        id: match.id,
        role: match.opportunities?.role || 'Unknown Role',
        orgName: match.opportunities?.profiles?.name || 'Organization',
        orgAvatarUrl: match.opportunities?.profiles?.avatar_url || null,
        matchScore: match.match_score,
        reason: match.reasoning,
        type: match.opportunities?.type || '',
        workMode: match.opportunities?.work_mode || '',
        matchedSkills: match.matched_skills || []
      }));
      setAiRecommendations(recommendations);
    }
    setLoadingRecommendations(false);
  };

  const handleRunMatching = async () => {
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
          body: JSON.stringify({ studentId: userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMatchError(result.message || result.error || 'Failed to run AI matching');
        setMatchLoading(false);
        return;
      }

      await fetchAiRecommendations();
    } catch (err: any) {
      setMatchError(err.message || 'Error running AI matching');
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 font-medium">User profile not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="space-y-6">
      <button
        onClick={() => onNavigate('HOME')}
        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-bold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-black to-gray-800"></div>

        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-end gap-4">
              <img
                src={profile.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="50" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3E?%3C/text%3E%3C/svg%3E'}
                className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                alt={profile.name}
              />
              <div className="pb-2">
                <h1 className="text-3xl font-black text-black">{profile.name}</h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {profile.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                </p>
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                  isFollowing
                    ? 'bg-black text-[#facc15] hover:bg-gray-800'
                    : 'bg-[#facc15] text-black hover:bg-yellow-500'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Follow
                  </>
                )}
              </button>
            )}
          </div>

          {profile.professional_summary && (
            <p className="text-sm text-gray-600 font-medium mb-4">{profile.professional_summary}</p>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            {profile.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {profile.email}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#facc15] hover:text-yellow-500"
              >
                <LinkIcon className="w-4 h-4" />
                Website
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-black text-black">{stats.postsCount}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-black">{stats.followers}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-black">{stats.following}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Following</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => handleTabChange('posts')}
            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'posts'
                ? 'text-black border-b-2 border-black bg-gray-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            Posts ({stats.postsCount})
          </button>
          <button
            onClick={() => handleTabChange('followers')}
            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'followers'
                ? 'text-black border-b-2 border-black bg-gray-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users className="w-5 h-5" />
            Followers ({stats.followers})
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'following'
                ? 'text-black border-b-2 border-black bg-gray-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            Following ({stats.following})
          </button>
          {profile?.user_type === 'STUDENT' && (
            <button
              onClick={() => handleTabChange('recommendations')}
              className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                selectedTab === 'recommendations'
                  ? 'text-black border-b-2 border-black bg-gray-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Zap className="w-5 h-5" />
              AI Matches
            </button>
          )}
        </div>

        <div className="p-6">
          {selectedTab === 'posts' && (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No posts yet</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isOwnPost={isOwnProfile}
                    onDelete={handleDeletePost}
                    onNavigate={onNavigate}
                  />
                ))
              )}
            </div>
          )}

          {selectedTab === 'followers' && (
            <div className="space-y-4">
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No followers yet</p>
                </div>
              ) : (
                followers.map(follower => (
                  <div key={follower.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-4">
                      <img
                        src={follower.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="50" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3E?%3C/text%3E%3C/svg%3E'}
                        alt={follower.name}
                        className="w-12 h-12 rounded-xl border border-gray-100 object-cover"
                      />
                      <div>
                        <h4 className="font-black text-black">{follower.name}</h4>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {follower.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('VIEW_USER', follower.id)}
                      className="px-4 py-2 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === 'following' && (
            <div className="space-y-4">
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Not following anyone yet</p>
                </div>
              ) : (
                following.map(followedUser => (
                  <div key={followedUser.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-4">
                      <img
                        src={followedUser.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="50" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-us"%3E?%3C/text%3E%3C/svg%3E'}
                        alt={followedUser.name}
                        className="w-12 h-12 rounded-xl border border-gray-100 object-cover"
                      />
                      <div>
                        <h4 className="font-black text-black">{followedUser.name}</h4>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {followedUser.user_type === 'STUDENT' ? 'Student' : 'Organization'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('VIEW_USER', followedUser.id)}
                      className="px-4 py-2 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="bg-black text-white rounded-2xl p-6 shadow-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-[#facc15] uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" /> AI Recommendations
                  </h3>
                  {isOwnProfile && (
                    <button
                      onClick={handleRunMatching}
                      disabled={matchLoading}
                      className="px-4 py-2 bg-[#facc15] text-black font-black rounded-lg text-[9px] uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {matchLoading ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Cpu className="w-3 h-3" /> Run AI Analysis</>
                      )}
                    </button>
                  )}
                </div>

                {matchError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                    <p className="text-[9px] text-red-400 font-bold">{matchError}</p>
                  </div>
                )}

                {loadingRecommendations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-[#facc15] animate-spin" />
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                      We found <span className="text-white font-bold">{aiRecommendations.length} new roles</span> that match this profile.
                    </p>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {aiRecommendations.map((rec) => (
                        <div key={rec.id} className="bg-white/10 border border-white/20 rounded-lg p-3 hover:bg-white/20 transition-all">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-white uppercase truncate">{rec.role}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {rec.orgAvatarUrl ? (
                                  <img src={rec.orgAvatarUrl} alt={rec.orgName} className="w-3.5 h-3.5 rounded object-cover" />
                                ) : (
                                  <Building className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                <p className="text-[9px] text-gray-400 truncate">{rec.orgName}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-[#facc15] shrink-0">{rec.matchScore}%</span>
                          </div>
                          {(rec.type || rec.workMode) && (
                            <div className="flex items-center gap-2 mb-1">
                              {rec.type && (
                                <span className="text-[8px] px-1.5 py-0.5 bg-white/10 text-gray-300 rounded font-bold uppercase">{rec.type}</span>
                              )}
                              {rec.workMode && (
                                <span className="text-[8px] px-1.5 py-0.5 bg-white/10 text-gray-300 rounded font-bold uppercase">{rec.workMode}</span>
                              )}
                            </div>
                          )}
                          {rec.reason && (
                            <p className="text-[8px] text-gray-400 line-clamp-2 mb-1">{rec.reason}</p>
                          )}
                          {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {rec.matchedSkills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="text-[7px] px-1.5 py-0.5 bg-[#facc15]/20 text-[#facc15] rounded font-bold">{skill}</span>
                              ))}
                              {rec.matchedSkills.length > 3 && (
                                <span className="text-[7px] px-1.5 py-0.5 text-gray-400">+{rec.matchedSkills.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-[9px] text-gray-400 font-bold">
                      {isOwnProfile ? 'Run AI Analysis to find matching opportunities' : 'No AI matches found yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
