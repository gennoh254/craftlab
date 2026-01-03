import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, Settings, Plus, Eye, CreditCard as Edit, Trash2, Search, Filter, Download, BarChart3, TrendingUp, Calendar, MapPin, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  location?: string;
  createdAt: string;
  followersCount: number;
  videosCount: number;
  completionScore: number;
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description?: string;
  requirements?: any;
  benefits?: string[];
  workType?: string;
  industry?: string;
  deadline?: string;
  applicationsCount: number;
  isActive: boolean;
  createdAt: string;
}

const LOCAL_OPPORTUNITIES_KEY = 'craftlab_opportunities';

const getStoredOpportunities = (): Opportunity[] => {
  try {
    const stored = localStorage.getItem(LOCAL_OPPORTUNITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeOpportunities = (opportunities: Opportunity[]) => {
  try {
    localStorage.setItem(LOCAL_OPPORTUNITIES_KEY, JSON.stringify(opportunities));
  } catch (error) {
    console.error('Error storing opportunities in local storage:', error);
  }
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'internship',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    workType: 'hybrid',
    industry: '',
    deadline: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const formattedUsers = usersData?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
        location: user.location,
        createdAt: user.created_at,
        followersCount: user.followers_count || 0,
        videosCount: user.videos_count || 0,
        completionScore: user.completion_score || 0
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users data:', error);
      setUsers([]);
    }

    const localOpportunities = getStoredOpportunities();
    setOpportunities(localOpportunities);
    setUsingLocalStorage(true);
    setLoading(false);
  };
  const handleCreateJob = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1️⃣ Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  console.log("AUTH USER 👉", user);

  if (!user) {
    alert("You must be logged in to post a job");
    return;
  }

  // 2️⃣ Attempt Supabase INSERT (DEBUG MODE)
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      description: newJob.description,
      requirements: newJob.requirements
        ? JSON.parse(newJob.requirements)
        : { skills: [], experience: '', education: '' },
      benefits: newJob.benefits
        ? newJob.benefits.split(',').map(b => b.trim())
        : [],
      work_type: newJob.workType,
      industry: newJob.industry,
      deadline: newJob.deadline || null,
      is_active: true,
      created_by: user.id,   // 🔥 REQUIRED
    })
    .select()
    .single();

  // 3️⃣ DEBUG OUTPUT (THIS IS THE TEMP FIX)
  if (error) {
    console.error("SUPABASE INSERT ERROR 👉", error);
    alert(error.message);

    // ⛑️ fallback to localStorage ONLY if DB fails
    const localOpportunity = {
      id: `local-${Date.now()}`,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      description: newJob.description,
      applicationsCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const existing = getStoredOpportunities();
    const updated = [localOpportunity, ...existing];
    storeOpportunities(updated);
    setOpportunities(updated);
    setUsingLocalStorage(true);
    return;
  }

  // 4️⃣ SUCCESS PATH
  console.log("INSERT SUCCESS 👉", data);
  setOpportunities(prev => [data, ...prev]);
  setUsingLocalStorage(false);

  // reset form
  setNewJob({
    title: '',
    company: '',
    location: '',
    type: 'internship',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    workType: 'hybrid',
    industry: '',
    deadline: ''
  });

  setShowCreateJob(false);
};
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'internship',
      salary: '',
      description: '',
      requirements: '',
      benefits: '',
      workType: 'hybrid',
      industry: '',
      deadline: ''
    });
    setShowCreateJob(false);
  };

  const toggleJobStatus = (jobId: string, currentStatus: boolean) => {
    const existingOpportunities = getStoredOpportunities();
    const updatedOpportunities = existingOpportunities.map(opp =>
      opp.id === jobId
        ? { ...opp, isActive: !currentStatus }
        : opp
    );
    storeOpportunities(updatedOpportunities);
    setOpportunities(updatedOpportunities);
    
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'User Type', 'Location', 'Followers', 'Videos', 'Completion Score', 'Created At'],
      ...users.map(user => [
        user.name,
        user.email,
        user.userType,
        user.location || '',
        user.followersCount.toString(),
        user.videosCount.toString(),
        user.completionScore.toString(),
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craftlab-users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalJobs: opportunities.length,
    activeJobs: opportunities.filter(job => job.isActive).length,
    totalApplications: opportunities.reduce((sum, job) => sum + job.applicationsCount, 0)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading admin dashboard...</p>
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
        {/* Local Storage Indicator */}
        {usingLocalStorage && (
          <div className="glass bg-blue-500/20 backdrop-blur-lg p-4 rounded-xl border border-blue-500/30 mb-6 animate-fadeInUp">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-blue-300 font-medium">Opportunities Stored Locally</p>
                <p className="text-blue-200 text-sm">
                  All posted opportunities are being saved to your browser's local storage. Data will persist across sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-300">Manage users, opportunities, and platform analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover-lift"
              >
                <Download className="h-4 w-4" />
                <span>Export Users</span>
              </button>
              <button
                onClick={() => setShowCreateJob(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
              >
                <Plus className="h-4 w-4" />
                <span>Post Job</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Active platform
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
                <p className="text-gray-300 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
                <p className="text-yellow-400 text-sm flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {stats.activeJobs} active
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
                <p className="text-gray-300 text-sm">Applications</p>
                <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                <p className="text-blue-400 text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Total received
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Platform Health</p>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Excellent
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '3s'}}>
                <BarChart3 className="h-6 w-6 text-white" />
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
          {activeTab === 'users' && (
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">User Management</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Location</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Stats</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Joined</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-sm rounded-full capitalize">
                            {user.userType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{user.location || 'Not specified'}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-300">
                            <p>{user.followersCount} followers</p>
                            <p>{user.videosCount} videos</p>
                            <p>{user.completionScore}% complete</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                              <Edit className="h-4 w-4" />
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

          {activeTab === 'jobs' && (
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Job Management</h3>
                <button
                  onClick={() => setShowCreateJob(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Job</span>
                </button>
              </div>

              <div className="grid gap-4">
                {opportunities.map((job, index) => (
                  <div key={job.id} className="glass bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">{job.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            job.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </span>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {job.applicationsCount} applications
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleJobStatus(job.id, job.isActive)}
                          className={`px-3 py-1 text-sm rounded-lg transition-all ${
                            job.isActive 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {job.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create Job Modal */}
        {showCreateJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Job</h3>
                <button
                  onClick={() => setShowCreateJob(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      required
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                    <input
                      type="text"
                      value={newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      required
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      required
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                      className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="internship">Internship</option>
                      <option value="attachment">Attachment</option>
                      <option value="apprenticeship">Apprenticeship</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="full-time">Full-time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    className="w-full px-4 py-3 glass bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateJob(false)}
                    className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift"
                  >
                    Create Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
