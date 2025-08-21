import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

const DemoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skills, setSkills] = useState({
    programming: ['JavaScript', 'Python', 'React', 'Node.js'],
    design: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
    data: ['Data Analysis', 'SQL', 'Excel']
  });
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('programming');

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills(prev => ({
        ...prev,
        [newSkillCategory]: [...prev[newSkillCategory], newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (category: string, skillToRemove: string) => {
    setSkills(prev => ({
      ...prev,
      [category]: prev[category].filter(skill => skill !== skillToRemove)
    }));
  };

  const handleDownloadCV = () => {
    // Create a mock PDF download
    const element = document.createElement('a');
    const file = new Blob(['This is a demo CV file for CraftLab platform'], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = 'demo-cv.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleViewPortfolio = () => {
    window.open('/demo-portfolio', '_blank');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <FileText className="h-5 w-5" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];

  const opportunities = [
    {
      title: "Software Development Internship",
      company: "TechCorp Kenya",
      location: "Nairobi, Kenya",
      salary: "KSh 25,000/month",
      deadline: "Dec 31, 2024",
      match: 95,
      type: "Internship"
    },
    {
      title: "Digital Marketing Volunteer",
      company: "NGO Impact",
      location: "Remote",
      salary: "Volunteer",
      deadline: "Jan 15, 2025",
      match: 88,
      type: "Volunteer"
    },
    {
      title: "Data Analysis Attachment",
      company: "Analytics Plus",
      location: "Mombasa, Kenya",
      salary: "KSh 20,000/month",
      deadline: "Jan 20, 2025",
      match: 92,
      type: "Attachment"
    }
  ];

  const certificates = [
    { name: "Bachelor's Degree in Computer Science", status: "verified", university: "University of Nairobi", date: "2023" },
    { name: "AWS Cloud Practitioner", status: "pending", university: "Amazon Web Services", date: "2024" },
    { name: "Google Analytics Certification", status: "verified", university: "Google", date: "2024" }
  ];

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
        {/* Demo Notice */}
        <div className="mb-6 glass bg-yellow-400/20 backdrop-blur-lg p-4 rounded-xl border border-yellow-400/30 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 text-yellow-400 animate-float" />
              <div>
                <h3 className="text-yellow-400 font-semibold">Demo Dashboard Preview</h3>
                <p className="text-yellow-200 text-sm">This is a preview of what your dashboard will look like. Sign up to access your real dashboard!</p>
              </div>
            </div>
            <Link
              to="/register"
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all hover-lift"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-float">
                <Building className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back to CraftLab</h1>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full">Organization</span>
                  <span className="text-gray-300">Demo Account</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 glass bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all hover-lift">
                <Bell className="h-5 w-5 text-white" />
              </button>
              <Link
                to="/login"
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all hover-lift flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Login to Real Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Opportunities</p>
                <p className="text-3xl font-bold text-white">12</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +3 this week
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Applications</p>
                <p className="text-3xl font-bold text-white">48</p>
                <p className="text-yellow-400 text-sm flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  15 pending
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Successful Placements</p>
                <p className="text-3xl font-bold text-white">156</p>
                <p className="text-green-400 text-sm flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  4.8 rating
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
                <p className="text-gray-300 text-sm">Profile Views</p>
                <p className="text-3xl font-bold text-white">2.4k</p>
                <p className="text-blue-400 text-sm flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '3s'}}>
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass bg-white/10 backdrop-blur-lg p-2 rounded-xl shadow-lg border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover-lift ${
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
                  Recent Opportunities
                </h3>
                <div className="space-y-4">
                  {opportunities.map((opportunity, index) => (
                    <div key={index} className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift">
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

                  <button
                    onClick={handleViewPortfolio}
                    className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">View Portfolio</p>
                      <p className="text-sm text-gray-400">See your public profile</p>
                    </div>
                  </button>

                  <button className="w-full glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Upload Certificate</p>
                      <p className="text-sm text-gray-400">Add new credentials</p>
                    </div>
                  </button>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Demo Organization"
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="demo@organization.com"
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization Type</label>
                    <select className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
                      <option value="tech">Technology Company</option>
                      <option value="ngo">Non-Profit Organization</option>
                      <option value="startup">Startup</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="We are a leading technology company focused on innovation and talent development. We provide opportunities for young professionals to grow and excel in their careers."
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
                    Areas of Focus
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
                              'bg-green-500/20 text-green-400'
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
                <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift">
                  <Upload className="h-4 w-4" />
                  <span>Upload Certificate</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert, index) => (
                  <div key={index} className="glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                        <Award className="h-6 w-6 text-black" />
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${
                        cert.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {cert.status === 'verified' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span className="capitalize">{cert.status}</span>
                      </span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{cert.name}</h4>
                    <p className="text-gray-300 text-sm mb-1">{cert.university}</p>
                    <p className="text-gray-400 text-sm">{cert.date}</p>
                  </div>
                ))}
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

export default DemoDashboard;