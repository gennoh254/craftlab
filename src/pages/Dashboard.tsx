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
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useCertificates } from '../hooks/useCertificates';
import { useOpportunities } from '../hooks/useOpportunities';
import { useAI } from '../hooks/useAI';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadProfilePicture } = useProfile();
  const { certificates, loading: certsLoading, uploadCertificate } = useCertificates();
  const { opportunities, loading: oppsLoading } = useOpportunities();
  const { analysis, insights, loading: aiLoading, analyzeProfile, generateMatches } = useAI();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skills, setSkills] = useState({
    programming: ['JavaScript', 'Python', 'React', 'Node.js'],
    design: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
    data: ['Data Analysis', 'SQL', 'Excel'],
    business: ['Project Management', 'Strategic Planning'],
    marketing: ['Digital Marketing', 'Content Creation']
  });
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('programming');
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Initialize profile data
  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
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
      const updatedSkills = {
        ...skills,
        [newSkillCategory]: [...skills[newSkillCategory], newSkill.trim()]
      };
      setSkills(updatedSkills);
      setNewSkill('');
      
      // Update profile with new skills
      await updateProfile({ skills: updatedSkills });
    }
  };

  const removeSkill = async (category: string, skillToRemove: string) => {
    if (user?.id) {
      const updatedSkills = {
        ...skills,
        [category]: skills[category].filter(skill => skill !== skillToRemove)
      };
      setSkills(updatedSkills);
      
      // Update profile with removed skill
      await updateProfile({ skills: updatedSkills });
    }
  };

  const handleDownloadCV = () => {
    // Create a mock PDF download
    const element = document.createElement('a');
    const file = new Blob(['This is your generated CV from CraftLab platform'], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `${user?.name || 'user'}-cv.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <FileText className="h-5 w-5" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="h-5 w-5" /> },
    { id: 'ai-insights', label: 'AI Insights', icon: <Brain className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];

  const mockOpportunities = [
    {
      id: '1',
      title: "Software Development Internship",
      company: "TechCorp Kenya",
      location: "Nairobi, Kenya",
      salary: "KSh 25,000/month",
      deadline: "Dec 31, 2024",
      match: 95,
      type: "Internship"
    },
    {
      id: '2',
      title: "Digital Marketing Volunteer",
      company: "NGO Impact",
      location: "Remote",
      salary: "Volunteer",
      deadline: "Jan 15, 2025",
      match: 88,
      type: "Volunteer"
    },
    {
      id: '3',
      title: "Data Analysis Attachment",
      company: "Analytics Plus",
      location: "Mombasa, Kenya",
      salary: "KSh 20,000/month",
      deadline: "Jan 20, 2025",
      match: 92,
      type: "Attachment"
    }
  ];

  const displayOpportunities = opportunities.length > 0 ? opportunities : mockOpportunities;

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
              <button className="p-2 glass bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all hover-lift">
                <Bell className="h-5 w-5 text-white" />
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
                <p className="text-3xl font-bold text-white">{displayOpportunities.length}</p>
                <p className="text-yellow-400 text-sm flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Matched for you
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
              {/* Recent Opportunities */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Matched Opportunities
                </h3>
                <div className="space-y-4">
                  {displayOpportunities.slice(0, 3).map((opportunity, index) => (
                    <div key={opportunity.id} className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{opportunity.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          opportunity.match >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {opportunity.match}% match
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
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {opportunity.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                      <p className="text-sm text-gray-400">Get your professional CV</p>
                    </div>
                  </button>

                  <button className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">View Portfolio</p>
                      <p className="text-sm text-gray-400">See your public profile</p>
                    </div>
                  </button>

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
                    <label className="block text-sm font-medium text-gray-300 mb-2">User Type</label>
                    <select 
                      defaultValue={user?.userType || 'attachee'}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="attachee">Attachee</option>
                      <option value="intern">Intern</option>
                      <option value="apprentice">Apprentice</option>
                      <option value="volunteer">Volunteer</option>
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
                    <span>{isEditingSkills ? 'Save' : 'Edit'}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(skills).map(([category, skillList]) => (
                    <div key={category}>
                      <h4 className="text-lg font-medium text-white mb-3 capitalize">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillList.map((skill, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 ${
                              category === 'programming' ? 'bg-blue-500/20 text-blue-400' :
                              category === 'design' ? 'bg-purple-500/20 text-purple-400' :
                              category === 'data' ? 'bg-green-500/20 text-green-400' :
                              category === 'business' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-pink-500/20 text-pink-400'
                            }`}
                          >
                            <span>{skill}</span>
                            {isEditingSkills && (
                              <button
                                onClick={() => removeSkill(category, skill)}
                                className="hover:text-red-400 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {isEditingSkills && (
                    <div className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
                      <div className="flex space-x-2">
                        <select
                          value={newSkillCategory}
                          onChange={(e) => setNewSkillCategory(e.target.value)}
                          className="px-3 py-2 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        >
                          <option value="programming">Programming</option>
                          <option value="design">Design</option>
                          <option value="data">Data</option>
                          <option value="business">Business</option>
                          <option value="marketing">Marketing</option>
                        </select>
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add new skill..."
                          className="flex-1 px-3 py-2 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <button
                          onClick={addSkill}
                          className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.length > 0 ? certificates.map((cert, index) => (
                    <div key={cert.id || index} className="glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                          <Award className="h-6 w-6 text-black" />
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${
                          cert.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {cert.status === 'verified' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span className="capitalize">{cert.status || 'pending'}</span>
                        </span>
                      </div>
                      <h4 className="font-semibold text-white mb-2">{cert.name}</h4>
                      <p className="text-gray-300 text-sm mb-1">{cert.university || cert.issuer || 'Unknown Issuer'}</p>
                      <p className="text-gray-400 text-sm">{cert.date || new Date().getFullYear()}</p>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No certificates uploaded yet</p>
                      <p className="text-gray-500 text-sm">Upload your first certificate to get started</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* AI Analysis */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInLeft">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  AI Profile Analysis
                </h3>
                
                {aiLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="mt-4 text-white">Analyzing your profile...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Completion Score */}
                    <div className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Profile Completion</span>
                        <span className="text-yellow-400 font-bold">{analysis?.completionScore || 75}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${analysis?.completionScore || 75}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-green-400" />
                        Your Strengths
                      </h4>
                      <div className="space-y-2">
                        {(analysis?.strengths || [
                          'Strong technical programming skills',
                          'Diverse skill set across multiple domains',
                          'Academic foundation ready for practical application'
                        ]).map((strength, index) => (
                          <div key={index} className="flex items-center space-x-2 text-green-400">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-400" />
                        AI Recommendations
                      </h4>
                      <div className="space-y-2">
                        {(analysis?.recommendations || [
                          'Consider learning React for modern web development',
                          'Build a strong portfolio showcasing your projects',
                          'Focus on building practical project experience'
                        ]).map((recommendation, index) => (
                          <div key={index} className="flex items-center space-x-2 text-blue-400">
                            <Zap className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Insights */}
              <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInRight">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-yellow-400 animate-float" />
                  Career Insights
                </h3>
                
                <div className="space-y-6">
                  {/* Skill Gaps */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-400" />
                      Skill Gaps to Address
                    </h4>
                    <div className="space-y-2">
                      {(analysis?.skillGaps || [
                        'Communication',
                        'Project Management',
                        'Git Version Control'
                      ]).map((gap, index) => (
                        <div key={index} className="flex items-center space-x-2 text-orange-400">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Career Path */}
                  <div className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-3">Recommended Career Path</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>
                        <span className="text-white">Complete current skills development</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                        <span className="text-gray-300">Apply for internship opportunities</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                        <span className="text-gray-300">Build professional portfolio</span>
                      </div>
                    </div>
                  </div>

                  {/* Generate New Analysis */}
                  <button
                    onClick={() => user?.id && analyzeProfile(user.id)}
                    disabled={aiLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Refresh AI Analysis'
                    )}
                  </button>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default Dashboard;