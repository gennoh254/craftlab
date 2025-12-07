import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Building,
  FileText,
  Award,
  Settings,
  Bell,
  Download,
  ExternalLink,
  Upload,
  Edit3,
  Plus,
  X,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Star,
  Briefcase,
  Target,
  BookOpen,
  Globe,
  Brain,
  Zap,
  BarChart3,
  Camera,
  Video,
  Phone,
  Trash2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useCertificates } from '../hooks/useCertificates';
import { useOpportunities } from '../hooks/useOpportunities';
import { useAI } from '../hooks/useAI';
import { useNotifications } from '../hooks/useNotifications';
import { useVideos } from '../hooks/useVideos';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadProfilePicture, uploadCV } = useProfile();
  const { certificates, loading: certsLoading, uploadCertificate } = useCertificates();
  const { opportunities, myOpportunities, loading: oppsLoading, fetchMyOpportunities } = useOpportunities();
  const { analysis, insights, loading: aiLoading, analyzeProfile, generateMatches } = useAI();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { videos, uploadVideo, deleteVideo } = useVideos();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skills, setSkills] = useState<Array<{name: string, description: string}>>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [opportunityDescription, setOpportunityDescription] = useState('');
  const [opportunityLocation, setOpportunityLocation] = useState('');
  const [opportunitySalary, setOpportunitySalary] = useState('');
  const [opportunityType, setOpportunityType] = useState('internship');
  const [opportunityDeadline, setOpportunityDeadline] = useState('');
  const [opportunityCompany, setOpportunityCompany] = useState('');
  const [postingOpportunity, setPostingOpportunity] = useState(false);
  const [applicants] = useState<Array<{id: string, name: string, email: string, status: 'pending'|'shortlisted'|'hired'}>>([
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'pending' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'shortlisted' },
  ]);

  // Initialize profile data
  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
    if (profile?.phone) {
      setPhoneNumber(profile.phone);
    }
  }, [profile]);

  // Generate AI analysis on component mount
  useEffect(() => {
    if (user?.id && !analysis) {
      analyzeProfile(user.id);
    }
  }, [user?.id, analysis, analyzeProfile]);

  const addSkill = async () => {
    if (newSkill.trim() && user?.id) {
      const updatedSkills = [...skills, { name: newSkill.trim(), description: newSkillDescription.trim() }];
      setSkills(updatedSkills);
      setNewSkill('');
      setNewSkillDescription('');

      // Update profile with new skills
      await updateProfile({ skills: updatedSkills });
    }
  };

  const removeSkill = async (skillNameToRemove: string) => {
    if (user?.id) {
      const updatedSkills = skills.filter(skill => skill.name !== skillNameToRemove);
      setSkills(updatedSkills);

      // Update profile with removed skill
      await updateProfile({ skills: updatedSkills });
    }
  };

  const handleDownloadCV = () => {
    if (profile?.cvUrl) {
      window.open(profile.cvUrl, '_blank');
    } else {
      alert('Please upload your CV first');
    }
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      setUploadingCert(true);
      try {
        await uploadCertificate(file, {
          name: file.name,
          userId: user.id,
          uploadDate: new Date().toISOString()
        });
      } catch (error) {
        console.error('Certificate upload failed:', error);
      } finally {
        setUploadingCert(false);
      }
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setUploadingPicture(true);
      try {
        await uploadProfilePicture(file);
      } catch (error) {
        console.error('Profile picture upload failed:', error);
        alert('Failed to upload profile picture. Please try again.');
      } finally {
        setUploadingPicture(false);
      }
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      if (!file.type.includes('pdf') && !file.type.includes('document')) {
        alert('Please select a PDF or document file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setUploadingCV(true);
      try {
        await uploadCV(file);
        alert('CV uploaded successfully!');
      } catch (error) {
        console.error('CV upload failed:', error);
        alert('Failed to upload CV. Please try again.');
      } finally {
        setUploadingCV(false);
      }
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert('Video size must be less than 100MB');
        return;
      }

      if (!videoTitle.trim()) {
        alert('Please enter a video title');
        return;
      }

      setUploadingVideo(true);
      try {
        await uploadVideo(file, { title: videoTitle, description: videoDescription });
        setVideoTitle('');
        setVideoDescription('');
        setShowVideoUpload(false);
        alert('Video uploaded successfully!');
      } catch (error) {
        console.error('Video upload failed:', error);
        alert('Failed to upload video. Please try again.');
      } finally {
        setUploadingVideo(false);
      }
    }
  };

  const handlePhoneUpdate = async () => {
    if (phoneNumber && user?.id) {
      await updateProfile({ phone: phoneNumber });
    }
  };

  const handlePostOpportunity = async () => {
    if (!user?.id) {
      alert('You must be logged in to post opportunities');
      return;
    }

    if (!opportunityTitle || !opportunityCompany || !opportunityLocation) {
      alert('Please fill in title, company, and location');
      return;
    }

    setPostingOpportunity(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profileData) {
        alert('Profile not found. Please complete your profile first.');
        setPostingOpportunity(false);
        return;
      }

      const { error } = await supabase
        .from('opportunities')
        .insert({
          title: opportunityTitle,
          company: opportunityCompany,
          location: opportunityLocation,
          type: opportunityType,
          salary: opportunitySalary,
          description: opportunityDescription,
          deadline: opportunityDeadline ? new Date(opportunityDeadline).toISOString() : null,
          created_by: profileData.id,
          is_active: true,
          requirements: { skills: [], experience: '', education: '' },
          work_type: 'hybrid'
        });

      if (error) throw error;

      setOpportunityTitle('');
      setOpportunityCompany('');
      setOpportunityDescription('');
      setOpportunityLocation('');
      setOpportunitySalary('');
      setOpportunityType('internship');
      setOpportunityDeadline('');
      setShowNewOpportunity(false);

      alert('Opportunity posted successfully!');
      await fetchMyOpportunities();
    } catch (error) {
      console.error('Error posting opportunity:', error);
      alert('Error posting opportunity. Please try again.');
    } finally {
      setPostingOpportunity(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <FileText className="h-5 w-5" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="h-5 w-5" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="h-5 w-5" /> },
    { id: 'ai-insights', label: 'AI Insights', icon: <Brain className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];


  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (user?.userType === 'organization') {
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{user?.name || 'Organization'} Dashboard</h1>
                  <p className="text-gray-300">Manage opportunities and applicants</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 glass bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all hover-lift"
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Applicants</p>
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-blue-400 text-sm flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Active applications
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Open Opportunities</p>
                  <p className="text-3xl font-bold text-white">{myOpportunities.length}</p>
                  <p className="text-green-400 text-sm flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Posted positions
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Hired Candidates</p>
                  <p className="text-3xl font-bold text-white">8</p>
                  <p className="text-yellow-400 text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Successful hires
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="glass bg-white/10 backdrop-blur-lg p-2 rounded-xl shadow-lg border border-white/20 mb-8 animate-fadeInUp">
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <User className="h-5 w-5" /> },
                { id: 'applicants', label: 'Applicants', icon: <Users className="h-5 w-5" /> },
                { id: 'opportunities', label: 'Opportunities', icon: <Briefcase className="h-5 w-5" /> },
                { id: 'profile', label: 'Profile', icon: <Building className="h-5 w-5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover-lift whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Recent Applicants */}
                  <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <Users className="h-6 w-6 mr-2 text-blue-400 animate-float" />
                      Recent Applicants
                    </h3>
                    <div className="space-y-3">
                      {applicants.map((applicant, index) => (
                        <div key={applicant.id} className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all hover-lift">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-white">{applicant.name}</h4>
                              <p className="text-gray-400 text-sm">{applicant.email}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                              applicant.status === 'hired' ? 'bg-green-500/20 text-green-400' :
                              applicant.status === 'shortlisted' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {applicant.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInRight">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <Target className="h-6 w-6 mr-2 text-blue-400 animate-float" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowNewOpportunity(true)}
                        className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all hover-lift flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                          <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">Post Opportunity</p>
                          <p className="text-sm text-gray-400">Create a new job listing</p>
                        </div>
                      </button>

                      <Link to="/profiles" className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all hover-lift flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">Browse Candidates</p>
                          <p className="text-sm text-gray-400">View all available candidates</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Posted Opportunities */}
                <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Briefcase className="h-6 w-6 mr-2 text-green-400 animate-float" />
                      Posted Opportunities
                    </h3>
                    <button
                      onClick={() => setShowNewOpportunity(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover-lift text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Post New</span>
                    </button>
                  </div>
                  {myOpportunities.length > 0 ? (
                    <div className="grid gap-4">
                      {myOpportunities.slice(0, 5).map((opp) => (
                        <div key={opp.id} className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-green-400/50 transition-all hover-lift">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{opp.title}</h4>
                              <p className="text-gray-400 text-sm">{opp.company}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs capitalize font-medium">{opp.type}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-white/10">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {opp.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {opp.salary}
                              </span>
                            </div>
                            {opp.deadline && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(opp.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-float" />
                      <p className="text-gray-400 text-sm mb-3">No opportunities posted yet</p>
                      <button
                        onClick={() => setShowNewOpportunity(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover-lift text-sm font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Post Your First Opportunity</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'applicants' && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-400 animate-float" />
                  All Applicants
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {applicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{applicant.name}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{applicant.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                              applicant.status === 'hired' ? 'bg-green-500/20 text-green-400' :
                              applicant.status === 'shortlisted' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {applicant.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="text-green-400 hover:text-green-300 transition-colors" title="Hire">
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button className="text-yellow-400 hover:text-yellow-300 transition-colors" title="Shortlist">
                                <Star className="h-4 w-4" />
                              </button>
                              <button className="text-red-400 hover:text-red-300 transition-colors" title="Reject">
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Briefcase className="h-6 w-6 mr-2 text-blue-400 animate-float" />
                    Posted Opportunities
                  </h3>
                  <button
                    onClick={() => setShowNewOpportunity(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover-lift"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Opportunity</span>
                  </button>
                </div>
                {myOpportunities.length > 0 ? (
                  <div className="grid gap-6">
                    {myOpportunities.map((opp, index) => (
                    <div key={opp.id} className="glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all hover-lift">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">{opp.title}</h4>
                          <p className="text-gray-300 text-sm mb-3">{opp.company}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs capitalize">{opp.type}</span>
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              8 applicants
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 pt-4 border-t border-white/10">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {opp.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {opp.salary}
                        </span>
                        {opp.deadline && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(opp.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-float" />
                    <h4 className="text-white text-lg font-semibold mb-2">No opportunities posted yet</h4>
                    <p className="text-gray-400 text-sm mb-4">Click the button above to post your first opportunity</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Building className="h-6 w-6 mr-2 text-blue-400 animate-float" />
                  Organization Profile
                </h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">About Organization</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your organization..."
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover-lift font-medium">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Post Opportunity Modal */}
          {showNewOpportunity && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Post New Opportunity</h3>
                  <button
                    onClick={() => setShowNewOpportunity(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePostOpportunity(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                      <input
                        type="text"
                        value={opportunityTitle}
                        onChange={(e) => setOpportunityTitle(e.target.value)}
                        placeholder="e.g., Senior React Developer"
                        required
                        className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                      <input
                        type="text"
                        value={opportunityCompany}
                        onChange={(e) => setOpportunityCompany(e.target.value)}
                        placeholder="e.g., TechCorp Kenya"
                        required
                        className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={opportunityDescription}
                      onChange={(e) => setOpportunityDescription(e.target.value)}
                      placeholder="Describe the opportunity, responsibilities, and expectations..."
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                      <input
                        type="text"
                        value={opportunityLocation}
                        onChange={(e) => setOpportunityLocation(e.target.value)}
                        placeholder="Nairobi, Kenya"
                        required
                        className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={opportunityType}
                        onChange={(e) => setOpportunityType(e.target.value)}
                        className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        <option value="internship">Internship</option>
                        <option value="attachment">Attachment</option>
                        <option value="full-time">Full-time</option>
                        <option value="apprentice">Apprentice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                      <input
                        type="text"
                        value={opportunitySalary}
                        onChange={(e) => setOpportunitySalary(e.target.value)}
                        placeholder="KES 50,000 - 100,000"
                        className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Application Deadline</label>
                    <input
                      type="date"
                      value={opportunityDeadline}
                      onChange={(e) => setOpportunityDeadline(e.target.value)}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={postingOpportunity}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-all hover-lift font-medium"
                    >
                      {postingOpportunity ? 'Posting...' : 'Post Opportunity'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewOpportunity(false)}
                      className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all hover-lift font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNotifications(false)}>
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Bell className="h-6 w-6 mr-2 text-blue-400" />
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{notif.title}</h4>
                            <p className="text-gray-300 text-sm">{notif.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
      {/* Background overlay */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={user?.name || 'User'}
                    className="w-16 h-16 rounded-full object-cover animate-float border-2 border-yellow-400"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-float">
                    <User className="h-8 w-8 text-black" />
                  </div>
                )}
                <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploadingPicture}
                  />
                  {uploadingPicture ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'User'}</h1>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-400 text-black text-sm rounded-full capitalize">
                    {user?.userType || 'Student'}
                  </span>
                  <span className="text-gray-300">CraftLab Member</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 glass bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all hover-lift"
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Profile Completion</p>
                <p className="text-3xl font-bold text-white">{profile?.completionScore || 75}%</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Looking good!
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Opportunities</p>
                <p className="text-3xl font-bold text-white">{opportunities.length}</p>
                <p className="text-blue-400 text-sm flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Available positions
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Certificates</p>
                <p className="text-3xl font-bold text-white">{certificates.length}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">AI Match Score</p>
                <p className="text-3xl font-bold text-white">{analysis?.completionScore || 85}%</p>
                <p className="text-blue-400 text-sm flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  AI Powered
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '3s'}}>
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass bg-white/10 backdrop-blur-lg p-2 rounded-xl shadow-lg border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover-lift whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Available Opportunities */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Available Opportunities
                </h3>
                {opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.slice(0, 3).map((opportunity, index) => (
                      <div key={opportunity.id} className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{opportunity.title}</h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 capitalize">
                            {opportunity.type}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{opportunity.company}</p>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {opportunity.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {opportunity.salary}
                            </span>
                          </div>
                          {opportunity.deadline && (
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(opportunity.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-float" />
                    <h4 className="text-white text-lg font-semibold mb-2">No opportunities available yet</h4>
                    <p className="text-gray-400 text-sm">Check back later for new opportunities posted by administrators</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInRight">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Target className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={handleDownloadCV}
                    className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                      <Download className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Download CV</p>
                      <p className="text-sm text-gray-400">{profile?.cvUrl ? 'Get your uploaded CV' : 'Upload CV first in Profile tab'}</p>
                    </div>
                  </button>

                  <Link to={`/profile/${profile?.id}`} className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">View Portfolio</p>
                      <p className="text-sm text-gray-400">See your public profile</p>
                    </div>
                  </Link>

                  <label className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift flex items-center space-x-3 cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                      {uploadingCert ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Upload className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Upload Certificate</p>
                      <p className="text-sm text-gray-400">Add new credentials</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificateUpload}
                      className="hidden"
                      disabled={uploadingCert}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <User className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                      <div className="relative group">
                        {profile?.profilePicture ? (
                          <img
                            src={profile.profilePicture}
                            alt={user?.name || 'User'}
                            className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <User className="h-12 w-12 text-black" />
                          </div>
                        )}
                        <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="hidden"
                            disabled={uploadingPicture}
                          />
                          {uploadingPicture ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          ) : (
                            <Camera className="h-8 w-8 text-white" />
                          )}
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <span>{uploadingPicture ? 'Uploading...' : 'Upload New Picture'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="hidden"
                            disabled={uploadingPicture}
                          />
                        </label>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+254 712 345 678"
                        className="flex-1 px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                      <button
                        onClick={handlePhoneUpdate}
                        className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CV/Resume</label>
                    <div className="space-y-2">
                      {profile?.cvUrl && (
                        <div className="flex items-center justify-between glass bg-white/5 backdrop-blur-lg p-3 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-green-400" />
                            <span className="text-white text-sm">CV Uploaded</span>
                            {profile.cvUploadedAt && (
                              <span className="text-gray-400 text-xs">
                                ({new Date(profile.cvUploadedAt).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                          <a
                            href={profile.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                      <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover-lift cursor-pointer w-full justify-center">
                        <Upload className="h-4 w-4" />
                        <span>{uploadingCV ? 'Uploading...' : profile?.cvUrl ? 'Replace CV' : 'Upload CV'}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCVUpload}
                          className="hidden"
                          disabled={uploadingCV}
                        />
                      </label>
                      <p className="text-xs text-gray-400">PDF or DOC. Max 10MB.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">User Type</label>
                    <select
                      defaultValue={user?.userType || 'attachee'}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="attachee">Attachee</option>
                      <option value="intern">Intern</option>
                      <option value="organization">Organization</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue={profile?.bio || 'Tell us about yourself...'}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Expertise */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInRight">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <BookOpen className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                    Skills & Expertise
                  </h3>
                  <button
                    onClick={() => setIsEditingSkills(!isEditingSkills)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditingSkills ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {skills.length === 0 ? (
                  <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                    <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-4 animate-float" />
                    <h4 className="text-white text-xl font-semibold mb-2">No skills added yet</h4>
                    <p className="text-gray-400 text-sm mb-6">Start building your skills portfolio by adding your expertise</p>
                    <button
                      onClick={() => setIsEditingSkills(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Your First Skill</span>
                    </button>
                  </div>
                ) : (
                  <div className="glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/3">Skill</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                          {isEditingSkills && <th className="w-16"></th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {skills.map((skill, index) => (
                          <tr key={index} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white font-medium">{skill.name}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm">{skill.description || 'No description provided'}</td>
                            {isEditingSkills && (
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => removeSkill(skill.name)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Remove skill"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isEditingSkills && (
                  <div className="mt-6 glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10">
                    <h5 className="text-white font-semibold mb-4 flex items-center text-lg">
                      <Plus className="h-5 w-5 mr-2 text-yellow-400" />
                      Add New Skill
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Skill Name</label>
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="e.g., React, Python, Project Management"
                          className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <input
                          type="text"
                          value={newSkillDescription}
                          onChange={(e) => setNewSkillDescription(e.target.value)}
                          placeholder="e.g., 3 years experience building web apps"
                          className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addSkill}
                      disabled={!newSkill.trim()}
                      className="mt-4 w-full px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold text-base"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Skill</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Award className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Certificates & Credentials
                </h3>
                <label className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>Upload Certificate</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCertificateUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {certsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="mt-4 text-white">Loading certificates...</p>
                </div>
              ) : certificates.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert, index) => (
                    <div key={cert.id || index} className="glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                          <Award className="h-6 w-6 text-black" />
                        </div>
                        {cert.fileUrl && (
                          <a
                            href={cert.fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Download certificate"
                          >
                            <Download className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                      <h4 className="font-semibold text-white mb-2">{cert.name}</h4>
                      <p className="text-gray-300 text-sm mb-1">{cert.university || cert.issuer || 'Unknown Issuer'}</p>
                      <p className="text-gray-400 text-sm mb-2">{cert.date || new Date().getFullYear()}</p>
                      {cert.fileUrl && (
                        <a
                          href={cert.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors text-sm mt-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                  <Award className="h-20 w-20 text-gray-400 mx-auto mb-4 animate-float" />
                  <h4 className="text-white text-xl font-semibold mb-2">No certificates uploaded yet</h4>
                  <p className="text-gray-400 text-sm mb-6">Upload your certificates to showcase your credentials and achievements</p>
                  <label className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span>Upload Your First Certificate</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificateUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Video className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Portfolio Videos
                </h3>
                <button
                  onClick={() => setShowVideoUpload(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Video</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length > 0 ? videos.map((video, index) => (
                  <div key={video.id} className="glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <Video className="h-16 w-16 text-white/30" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2">{video.title}</h4>
                      {video.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3 text-gray-400">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {video.viewsCount}
                          </span>
                          {video.duration && (
                            <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No videos uploaded yet</p>
                    <p className="text-gray-500 text-sm">Upload your first portfolio video</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Brain className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                AI Matched Opportunities
              </h3>

              {skills.length === 0 ? (
                <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                  <Brain className="h-20 w-20 text-gray-400 mx-auto mb-4 animate-float" />
                  <h4 className="text-white text-xl font-semibold mb-2">Add Your Skills First</h4>
                  <p className="text-gray-400 text-sm mb-6">Our AI needs to know your skills to match you with relevant opportunities</p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Skills in Profile</span>
                  </button>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                  <Briefcase className="h-20 w-20 text-gray-400 mx-auto mb-4 animate-float" />
                  <h4 className="text-white text-xl font-semibold mb-2">No Opportunities Available Yet</h4>
                  <p className="text-gray-400 text-sm">Check back later when administrators post new opportunities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-300 text-sm">
                      Analyzing <span className="text-yellow-400 font-semibold">{skills.length}</span> skills against <span className="text-yellow-400 font-semibold">{opportunities.length}</span> opportunities
                    </p>
                    <button
                      onClick={() => user?.id && generateMatches(user.id)}
                      disabled={aiLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift text-sm font-medium disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span>Matching...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Refresh Matches</span>
                        </>
                      )}
                    </button>
                  </div>

                  {(() => {
                    const userSkillNames = skills.map(s => s.name.toLowerCase());
                    const matchedOpps = opportunities.map(opp => {
                      const oppSkills = opp.requirements?.skills || [];
                      const matchedSkills = oppSkills.filter(oppSkill =>
                        userSkillNames.some(userSkill =>
                          userSkill.includes(oppSkill.toLowerCase()) ||
                          oppSkill.toLowerCase().includes(userSkill)
                        )
                      );
                      const matchScore = oppSkills.length > 0
                        ? Math.round((matchedSkills.length / oppSkills.length) * 100)
                        : 0;
                      return { ...opp, matchScore, matchedSkills };
                    }).filter(opp => opp.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);

                    return matchedOpps.length > 0 ? (
                      matchedOpps.map((opportunity, index) => (
                        <div key={opportunity.id} className="glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-white">{opportunity.title}</h4>
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  opportunity.matchScore >= 80 ? 'bg-green-500/20 text-green-400' :
                                  opportunity.matchScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                                  opportunity.matchScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {opportunity.matchScore}% Match
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{opportunity.company}</p>

                              {opportunity.matchedSkills.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs text-gray-400 mb-2 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                                    Matched Skills:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {opportunity.matchedSkills.map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs border border-green-500/20">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4 text-gray-400">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {opportunity.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {opportunity.salary}
                              </span>
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs capitalize">
                                {opportunity.type}
                              </span>
                            </div>
                            {opportunity.deadline && (
                              <span className="flex items-center text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(opportunity.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                        <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                        <h4 className="text-white text-lg font-semibold mb-2">No Matching Opportunities Found</h4>
                        <p className="text-gray-400 text-sm mb-4">None of the available opportunities match your current skills</p>
                        <button
                          onClick={() => setActiveTab('profile')}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover-lift text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add More Skills</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Account Settings */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Settings className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Account Settings
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-400">Receive updates about new opportunities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Profile Visibility</h4>
                      <p className="text-sm text-gray-400">Make your profile visible to organizations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">SMS Notifications</h4>
                      <p className="text-sm text-gray-400">Get text messages for urgent updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInRight">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Privacy & Security
                </h3>
                <div className="space-y-4">
                  <button className="w-full text-left glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift">
                    <h4 className="font-medium text-white mb-1">Change Password</h4>
                    <p className="text-sm text-gray-400">Update your account password</p>
                  </button>

                  <button className="w-full text-left glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift">
                    <h4 className="font-medium text-white mb-1">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </button>

                  <button className="w-full text-left glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift">
                    <h4 className="font-medium text-white mb-1">Download Data</h4>
                    <p className="text-sm text-gray-400">Export your account information</p>
                  </button>

                  <button className="w-full text-left glass bg-red-500/10 backdrop-blur-lg p-4 rounded-lg border border-red-500/20 hover:border-red-400/50 transition-all hover-lift">
                    <h4 className="font-medium text-red-400 mb-1">Delete Account</h4>
                    <p className="text-sm text-red-300">Permanently remove your account</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Upload Modal */}
        {showVideoUpload && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Upload Video</h3>
                <button
                  onClick={() => setShowVideoUpload(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="My Portfolio Project"
                    className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Describe your video..."
                    className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
                  <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingVideo ? 'Uploading...' : 'Choose Video'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={uploadingVideo}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">MP4, MOV, AVI. Max 100MB.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNotifications(false)}>
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Bell className="h-6 w-6 mr-2 text-yellow-400" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No notifications yet</p>
                  <p className="text-gray-500 text-sm">You'll be notified about new opportunities and updates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border ${
                        notif.isRead ? 'border-white/10' : 'border-yellow-400/50'
                      } hover:border-yellow-400/50 transition-all`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {notif.type === 'placement_success' ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : notif.type === 'opportunity_update' ? (
                              <Briefcase className="h-5 w-5 text-blue-400" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-400" />
                            )}
                            <h4 className="font-semibold text-white">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{notif.message}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;