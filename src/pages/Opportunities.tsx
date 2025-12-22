import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

// Local storage constants
const LOCAL_OPPORTUNITIES_KEY = 'craftlab_opportunities';

// Local storage helper functions
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

const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

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
      setUsingLocalStorage(false);

      // Sync with local storage for offline capability
      storeOpportunities(formatted);
    } catch (error) {
      console.log('Supabase unavailable, using local storage');

      // Fallback to local storage
      const localOpportunities = getStoredOpportunities();
      setOpportunities(localOpportunities);
      setUsingLocalStorage(true);
    } finally {
      setLoading(false);
    }
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
        {/* Local Storage Indicator */}
        {usingLocalStorage && (
          <div className="glass bg-blue-500/20 backdrop-blur-lg p-4 rounded-xl border border-blue-500/30 mb-6 animate-fadeInUp">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-blue-300 font-medium">Operating in Offline Mode</p>
                <p className="text-blue-200 text-sm">Data is being stored locally. Changes will sync when database connection is restored.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Career Opportunities</h1>
            <p className="text-gray-300">Browse opportunities posted by registered organizations</p>
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


        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="glass bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="mb-4">
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
              <p className="text-gray-400">Try adjusting your search or filters to find more opportunities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
