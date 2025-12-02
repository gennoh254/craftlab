import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Briefcase, MapPin, DollarSign, Clock, X, Edit2, Trash2, Building, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements?: any;
  deadline?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'internship',
    salary: '',
    description: '',
    deadline: ''
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data?.map(opp => ({
        id: opp.id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        type: opp.type,
        salary: opp.salary || '',
        description: opp.description || '',
        requirements: opp.requirements,
        deadline: opp.deadline,
        createdBy: opp.created_by,
        createdAt: opp.created_at,
        isActive: opp.is_active
      })) || [];

      setOpportunities(formatted);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert('You must be logged in to post opportunities');
      return;
    }

    if (!formData.title || !formData.company || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Get user's profile ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profileData) {
        alert('Profile not found. Please complete your profile first.');
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('opportunities')
          .update({
            title: formData.title,
            company: formData.company,
            location: formData.location,
            type: formData.type,
            salary: formData.salary,
            description: formData.description,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('created_by', profileData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert({
            title: formData.title,
            company: formData.company,
            location: formData.location,
            type: formData.type,
            salary: formData.salary,
            description: formData.description,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            created_by: profileData.id,
            is_active: true,
            requirements: { skills: [], experience: '', education: '' },
            work_type: 'hybrid'
          });

        if (error) throw error;
      }

      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'internship',
        salary: '',
        description: '',
        deadline: ''
      });
      setEditingId(null);
      setShowCreateForm(false);
      fetchOpportunities();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      alert('Error saving opportunity. Please try again.');
    }
  };

  const handleDelete = async (oppId: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }

    try {
      // Get user's profile ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .maybeSingle();

      if (!profileData) return;

      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', oppId)
        .eq('created_by', profileData.id);

      if (error) throw error;
      fetchOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      alert('Error deleting opportunity');
    }
  };

  const handleEdit = async (opp: Opportunity) => {
    // Get user's profile ID
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user?.id)
      .maybeSingle();

    if (!profileData || opp.createdBy !== profileData.id) {
      alert('You can only edit your own opportunities');
      return;
    }
    setFormData({
      title: opp.title,
      company: opp.company,
      location: opp.location,
      type: opp.type,
      salary: opp.salary,
      description: opp.description,
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : ''
    });
    setEditingId(opp.id);
    setShowCreateForm(true);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || opp.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading opportunities...</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">Opportunities</h1>
              <p className="text-gray-300">Browse and post career opportunities</p>
            </div>
            {user && (
              <button
                onClick={() => {
                  setFormData({
                    title: '',
                    company: '',
                    location: '',
                    type: 'internship',
                    salary: '',
                    description: '',
                    deadline: ''
                  });
                  setEditingId(null);
                  setShowCreateForm(!showCreateForm);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Post Opportunity</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, or location..."
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
                <option value="internship">Internship</option>
                <option value="attachment">Attachment</option>
                <option value="apprentice">Apprentice</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Building className="h-6 w-6 mr-2 text-yellow-400" />
                {editingId ? 'Edit Opportunity' : 'Post New Opportunity'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Software Development Internship"
                    className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g., TechCorp Kenya"
                    className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Nairobi, Kenya"
                    className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="internship">Internship</option>
                    <option value="attachment">Attachment</option>
                    <option value="apprentice">Apprentice</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g., KSh 25,000/month"
                    className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the opportunity, responsibilities, and expectations..."
                  rows={4}
                  className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Application Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-3 glass bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift font-semibold"
                >
                  {editingId ? 'Update Opportunity' : 'Post Opportunity'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all hover-lift font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="glass bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{opportunity.title}</h3>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full capitalize font-medium">
                        {opportunity.type}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{opportunity.company}</p>
                    {opportunity.description && (
                      <p className="text-gray-400 text-sm mb-4">{opportunity.description}</p>
                    )}
                  </div>
                  {user?.id === opportunity.createdBy && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(opportunity)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(opportunity.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {opportunity.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {opportunity.salary || 'Negotiable'}
                  </span>
                  {opportunity.deadline && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 glass bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No opportunities found</h3>
              <p className="text-gray-400">Try adjusting your search or be the first to post an opportunity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
