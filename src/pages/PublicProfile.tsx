import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Download,
  Video as VideoIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PublicProfileData {
  id: string;
  name: string;
  email: string;
  userType: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  profilePicture?: string;
  cvUrl?: string;
  skills: Array<{name: string, description: string}>;
  cvUrl?: string;
  experience?: string;
  education?: string;
  completionScore?: number;
  createdAt: string;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  viewsCount: number;
  createdAt: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer?: string;
  university?: string;
  date?: string;
  status?: string;
}

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('is_public', true)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          userType: profileData.user_type,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          website: profileData.website,
          profilePicture: profileData.profile_picture,
          cvUrl: profileData.cv_url,
          skills: profileData.skills || [],
          experience: profileData.experience,
          education: profileData.education,
          completionScore: profileData.completion_score,
          createdAt: profileData.created_at
        });

        const { data: certsData } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'verified');

        if (certsData) {
          setCertificates(certsData.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            university: cert.university,
            date: cert.date,
            status: cert.status
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError('Profile not found or is private');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = () => {
    if (!profile) return;

    const cvContent = `
CraftLab Professional Portfolio

Name: ${profile.name}
Email: ${profile.email}
Location: ${profile.location || 'Not specified'}
User Type: ${profile.userType}

${profile.bio ? `About:\n${profile.bio}\n` : ''}

Skills:
${profile.skills.map(skill => `- ${skill.name}${skill.description ? `: ${skill.description}` : ''}`).join('\n')}

${profile.experience ? `Experience:\n${profile.experience}\n` : ''}
${profile.education ? `Education:\n${profile.education}\n` : ''}

Certificates:
${certificates.map(cert => `- ${cert.name} ${cert.issuer ? `(${cert.issuer})` : ''} ${cert.date ? `- ${cert.date}` : ''}`).join('\n')}

Generated from CraftLab Platform
    `.trim();

    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `${profile.name.replace(/\s+/g, '_')}_portfolio.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This profile is private or does not exist'}</p>
          <button
            onClick={() => navigate('/profiles')}
            className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all"
          >
            Back to Profiles
          </button>
        </div>
      </div>
    );
  }

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchVideos();
    }
  }, [userId]);

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const videosData: Video[] = data.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          videoUrl: video.video_url,
          thumbnailUrl: video.thumbnail_url,
          viewsCount: video.views_count || 0,
          createdAt: video.created_at
        }));
        setVideos(videosData);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

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
        <button
          onClick={() => navigate('/profiles')}
          className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Discover Talent</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
              <div className="text-center">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-yellow-400"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-16 w-16 text-black" />
                  </div>
                )}

                <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
                <span className="px-3 py-1 bg-yellow-400 text-black text-sm rounded-full capitalize">
                  {profile.userType}
                </span>

                {profile.completionScore && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-300">Profile Completion</span>
                      <span className="text-yellow-400 font-bold">{profile.completionScore}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${profile.completionScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {profile.email && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm break-all">{profile.email}</span>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Globe className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-yellow-400 transition-colors flex items-center space-x-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm">Member since {new Date(profile.createdAt).getFullYear()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownloadCV}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift font-semibold"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Portfolio</span>
                </button>
                {profile.cvUrl && (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover-lift font-semibold"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download CV</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {profile.bio && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="h-6 w-6 mr-2 text-yellow-400" />
                  About
                </h2>
                <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-yellow-400" />
                  Skills & Expertise
                </h2>

                <div className="glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/3">Skill</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {profile.skills.map((skill, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{skill.name}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{skill.description || 'No description provided'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {profile.experience && (
                <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Briefcase className="h-6 w-6 mr-2 text-yellow-400" />
                    Experience
                  </h2>
                  <p className="text-gray-300">{profile.experience}</p>
                </div>
              )}

              {profile.education && (
                <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Award className="h-6 w-6 mr-2 text-yellow-400" />
                    Education
                  </h2>
                  <p className="text-gray-300">{profile.education}</p>
                </div>
              )}
            </div>

            {videos.length > 0 && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <VideoIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  Portfolio Videos
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all overflow-hidden"
                    >
                      <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                        <VideoIcon className="h-16 w-16 text-white/30" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-1">{video.title}</h3>
                        {video.description && (
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{video.description}</p>
                        )}
                        <div className="flex items-center space-x-3 text-gray-400 text-sm">
                          <span className="flex items-center">
                            <VideoIcon className="h-4 w-4 mr-1" />
                            {video.viewsCount} views
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certificates.length > 0 && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-yellow-400" />
                  Certificates & Credentials
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {certificates.map((cert, index) => (
                    <div
                      key={cert.id}
                      className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-black" />
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full flex items-center space-x-1 bg-green-500/20 text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{cert.name}</h3>
                      {(cert.issuer || cert.university) && (
                        <p className="text-gray-300 text-sm mb-1">{cert.issuer || cert.university}</p>
                      )}
                      {cert.date && (
                        <p className="text-gray-400 text-sm">{cert.date}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
