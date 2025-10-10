import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Briefcase, Users, Play, Heart, Eye, UserPlus, UserMinus, Search, Filter, Grid2x2 as Grid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  skills: any;
  followersCount: number;
  followingCount: number;
  videosCount: number;
  isFollowing?: boolean;
}

const UserProfiles: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which users current user is following
      let followingIds: string[] = [];
      if (user?.id) {
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        followingIds = followsData?.map(f => f.following_id) || [];
      }

      const profilesWithFollowStatus = profilesData?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        userType: profile.user_type,
        bio: profile.bio,
        location: profile.location,
        profilePicture: profile.profile_picture,
        skills: profile.skills,
        followersCount: profile.followers_count || 0,
        followingCount: profile.following_count || 0,
        videosCount: profile.videos_count || 0,
        isFollowing: followingIds.includes(profile.id)
      })) || [];

      setProfiles(profilesWithFollowStatus);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // Fallback to mock data
      setProfiles([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          userType: 'attachee',
          bio: 'Computer Science student passionate about web development',
          location: 'Nairobi, Kenya',
          skills: { programming: ['JavaScript', 'React'], design: [] },
          followersCount: 45,
          followingCount: 23,
          videosCount: 3
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          userType: 'intern',
          bio: 'UI/UX Designer with a passion for creating beautiful interfaces',
          location: 'Mombasa, Kenya',
          skills: { design: ['Figma', 'Adobe XD'], programming: [] },
          followersCount: 67,
          followingCount: 34,
          videosCount: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (profileId: string) => {
    if (!user?.id) return;

    try {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      if (profile.isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileId
          });
      }

      // Update local state
      setProfiles(prev => prev.map(p => 
        p.id === profileId 
          ? { 
              ...p, 
              isFollowing: !p.isFollowing,
              followersCount: p.isFollowing ? p.followersCount - 1 : p.followersCount + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || profile.userType === filterType;
    
    return matchesSearch && matchesFilter && profile.id !== user?.id;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative page-transition"
         style={{
           backgroundImage: `url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Discover Talent</h1>
              <p className="text-gray-300">Connect with other professionals and build your network</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 glass bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all hover-lift"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5 text-white" /> : <Grid className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, bio, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="attachee">Attachees</option>
                <option value="intern">Interns</option>
                <option value="apprentice">Apprentices</option>
                <option value="volunteer">Volunteers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profiles Grid/List */}
        <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {filteredProfiles.map((profile, index) => (
            <Link
              key={profile.id}
              to={`/profiles/${profile.id}`}
              className={`glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp block ${
                viewMode === 'list' ? 'flex items-center space-x-6' : ''
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Profile Picture */}
              <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'text-center mb-4'}`}>
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto animate-float border-2 border-yellow-400"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto animate-float">
                    <User className="h-8 w-8 text-black" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'}`}>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{profile.name}</h3>
                    <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-sm rounded-full capitalize">
                      {profile.userType}
                    </span>
                  </div>
                  
                  {/* Follow Button */}
                  {user && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleFollow(profile.id);
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all hover-lift ${
                        profile.isFollowing
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-yellow-400 text-black hover:bg-yellow-300'
                      } ${viewMode === 'grid' ? 'mt-4' : ''}`}
                    >
                      {profile.isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      <span>{profile.isFollowing ? 'Unfollow' : 'Follow'}</span>
                    </button>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className={`text-gray-300 text-sm ${viewMode === 'list' ? 'mt-2' : 'mt-3'}`}>
                    {profile.bio.length > 100 ? `${profile.bio.substring(0, 100)}...` : profile.bio}
                  </p>
                )}

                {/* Location */}
                {profile.location && (
                  <div className={`flex items-center justify-center text-gray-400 text-sm ${viewMode === 'list' ? 'mt-2' : 'mt-3'}`}>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* Skills Preview */}
                {profile.skills && (
                  <div className={`${viewMode === 'list' ? 'mt-2' : 'mt-3'}`}>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {[...profile.skills.programming || [], ...profile.skills.design || [], ...profile.skills.data || []]
                        .slice(0, 3)
                        .map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      {([...profile.skills.programming || [], ...profile.skills.design || [], ...profile.skills.data || []].length > 3) && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                          +{([...profile.skills.programming || [], ...profile.skills.design || [], ...profile.skills.data || []].length - 3)} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className={`flex items-center justify-center space-x-6 text-sm text-gray-400 ${viewMode === 'list' ? 'mt-2' : 'mt-4'}`}>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{profile.followersCount} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Play className="h-4 w-4" />
                    <span>{profile.videosCount} videos</span>
                  </div>
                </div>

                {/* View Profile Link */}
                <div className={`${viewMode === 'list' ? 'mt-2' : 'mt-4'} text-center`}>
                  <span className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors inline-flex items-center space-x-1">
                    <span>View Full Portfolio</span>
                    <Eye className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfiles;