import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AIProfileMatcher } from '../utils/aiMatcher';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'attachment' | 'apprenticeship' | 'volunteer' | 'full-time';
  salary: string;
  deadline: string;
  description: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
  };
  benefits: string[];
  workType: 'remote' | 'onsite' | 'hybrid';
  industry: string;
  match?: number;
  matchReasons?: string[];
}

export interface Application {
  id: string;
  opportunityId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedDate: string;
  opportunity: Opportunity;
}

export const useOpportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [matches, setMatches] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      const opportunitiesData: Opportunity[] = (data || []).map(opp => ({
        id: opp.id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        type: opp.type as Opportunity['type'],
        salary: opp.salary || '',
        deadline: opp.deadline || '',
        description: opp.description || '',
        requirements: opp.requirements || { skills: [], experience: '', education: '' },
        benefits: opp.benefits || [],
        workType: opp.work_type as Opportunity['workType'],
        industry: opp.industry || ''
      }));

      setOpportunities(opportunitiesData);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profileData || opportunities.length === 0) {
        setMatches([]);
        return;
      }

      const userProfile = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        userType: profileData.user_type,
        skills: profileData.skills || {
          programming: [],
          design: [],
          data: [],
          business: [],
          marketing: []
        },
        experience: profileData.experience || '',
        education: profileData.education || '',
        location: profileData.location || '',
        preferences: profileData.preferences || {
          workType: 'hybrid',
          salaryRange: '',
          industries: []
        }
      };

      const matcher = AIProfileMatcher.getInstance();
      const matchedOpportunities = matcher.matchOpportunities(userProfile, opportunities);

      const topMatches = matchedOpportunities.slice(0, 10).map(match => ({
        ...match,
        match: Math.round(match.matchScore),
        matchReasons: match.matchReasons
      }));

      setMatches(topMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const applyToOpportunity = async (opportunityId: string, applicationData: any) => {
    if (!user?.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          cover_letter: applicationData.coverLetter,
          additional_info: applicationData.additionalInfo,
          status: 'pending'
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
        const opportunity = opportunities.find(opp => opp.id === opportunityId);
        if (opportunity) {
          const newApplication: Application = {
            id: data.id,
            opportunityId: data.opportunity_id,
            userId: data.user_id,
            status: data.status as Application['status'],
            appliedDate: data.applied_date,
            opportunity
          };
          setApplications(prev => [newApplication, ...prev]);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error applying to opportunity:', err);
      setError('Failed to submit application');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities (*)
        `)
        .eq('user_id', user.id)
        .order('applied_date', { ascending: false });

      if (supabaseError) throw supabaseError;

      const applicationsData: Application[] = (data || []).map(app => ({
        id: app.id,
        opportunityId: app.opportunity_id,
        userId: app.user_id,
        status: app.status as Application['status'],
        appliedDate: app.applied_date,
        opportunity: {
          id: app.opportunities.id,
          title: app.opportunities.title,
          company: app.opportunities.company,
          location: app.opportunities.location,
          type: app.opportunities.type,
          salary: app.opportunities.salary || '',
          deadline: app.opportunities.deadline || '',
          description: app.opportunities.description || '',
          requirements: app.opportunities.requirements || { skills: [], experience: '', education: '' },
          benefits: app.opportunities.benefits || [],
          workType: app.opportunities.work_type,
          industry: app.opportunities.industry || ''
        }
      }));

      setApplications(applicationsData);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (opportunities.length > 0) {
      fetchMatches();
    }
  }, [opportunities, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user?.id]);

  return {
    opportunities,
    matches,
    applications,
    loading,
    error,
    fetchOpportunities,
    fetchMatches,
    applyToOpportunity,
    fetchApplications
  };
};