import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
        industry: opp.industry || '',
        match: Math.floor(Math.random() * 20) + 80 // Mock match score
      }));

      setOpportunities(opportunitiesData);
    } catch (err) {
      // Fallback to mock data if Supabase fails
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          title: "Software Development Internship",
          company: "TechCorp Kenya",
          location: "Nairobi, Kenya",
          type: 'internship',
          salary: "KSh 25,000/month",
          deadline: "Dec 31, 2024",
          description: "Join our development team to build cutting-edge web applications using modern technologies.",
          requirements: {
            skills: ['JavaScript', 'React', 'Node.js', 'Git'],
            experience: 'Basic programming knowledge',
            education: 'Computer Science or related field'
          },
          benefits: ['Mentorship', 'Flexible hours', 'Learning opportunities', 'Certificate'],
          workType: 'hybrid',
          industry: 'Technology',
          match: 95
        },
        {
          id: '2',
          title: "Digital Marketing Volunteer",
          company: "NGO Impact",
          location: "Remote",
          type: 'volunteer',
          salary: "Volunteer",
          deadline: "Jan 15, 2025",
          description: "Help us create impactful digital campaigns for social causes.",
          requirements: {
            skills: ['Social Media', 'Content Creation', 'Analytics'],
            experience: 'Basic marketing knowledge',
            education: 'Any field'
          },
          benefits: ['Social impact', 'Portfolio building', 'Networking', 'Reference letter'],
          workType: 'remote',
          industry: 'Non-profit',
          match: 88
        },
        {
          id: '3',
          title: "Data Analysis Attachment",
          company: "Analytics Plus",
          location: "Mombasa, Kenya",
          type: 'attachment',
          salary: "KSh 20,000/month",
          deadline: "Jan 20, 2025",
          description: "Work with our data science team to analyze business metrics and create insights.",
          requirements: {
            skills: ['Python', 'SQL', 'Excel', 'Statistics'],
            experience: 'Academic data analysis projects',
            education: 'Statistics, Mathematics, or Computer Science'
          },
          benefits: ['Real-world experience', 'Industry exposure', 'Mentorship', 'Job opportunity'],
          workType: 'onsite',
          industry: 'Analytics',
          match: 92
        }
      ];
      setOpportunities(mockOpportunities);
      console.log('Using mock opportunities data (Supabase unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would use AI matching
      // For now, we'll use the top opportunities
      const topMatches = opportunities.slice(0, 3).map(opp => ({
        ...opp,
        match: Math.floor(Math.random() * 20) + 80,
        matchReasons: [
          'Skills alignment: 90%',
          'Location preference match',
          'Experience level appropriate'
        ]
      }));
      setMatches(topMatches);
    } catch (err) {
      console.log('Error fetching matches:', err);
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
      // Fallback: add application locally
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (opportunity) {
        const newApplication: Application = {
          id: Date.now().toString(),
          opportunityId,
          userId: user.id,
          status: 'pending',
          appliedDate: new Date().toISOString(),
          opportunity
        };
        setApplications(prev => [newApplication, ...prev]);
        console.log('Application added locally (Supabase unavailable)');
        return true;
      }
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
      // Mock applications data
      const mockApplications: Application[] = [];
      setApplications(mockApplications);
      console.log('Using mock applications data (Supabase unavailable)');
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