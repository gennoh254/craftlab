import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface AIAnalysis {
  strengths: string[];
  recommendations: string[];
  completionScore: number;
  skillGaps: string[];
}

export interface AIInsights {
  careerPath: string[];
  industryTrends: string[];
  skillDemand: { skill: string; demand: number }[];
  salaryInsights: {
    averageSalary: string;
    salaryRange: string;
    location: string;
  };
}

export const useAI = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProfile = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiAPI.analyzeProfile(userId);
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (err) {
      // Fallback to mock analysis if API fails
      const mockAnalysis: AIAnalysis = {
        strengths: [
          'Strong technical programming skills',
          'Diverse skill set across multiple domains',
          'Academic foundation ready for practical application',
          'Eager to learn and gain professional experience'
        ],
        recommendations: [
          'Consider learning React for modern web development',
          'Build a strong portfolio showcasing your projects',
          'Focus on building practical project experience',
          'Network with professionals in your field'
        ],
        completionScore: 85,
        skillGaps: [
          'Communication',
          'Project Management',
          'Git Version Control',
          'Testing & Debugging',
          'Agile Methodologies'
        ]
      };
      setAnalysis(mockAnalysis);
      console.log('Using mock AI analysis data');
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiAPI.generateMatches(userId);
      if (response.success) {
        return response.matches;
      }
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate matches');
      console.error('AI matching error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getInsights = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiAPI.getInsights(userId);
      if (response.success) {
        setInsights(response.insights);
      }
    } catch (err) {
      // Fallback to mock insights if API fails
      const mockInsights: AIInsights = {
        careerPath: [
          'Complete current skills development',
          'Apply for internship opportunities',
          'Build professional portfolio',
          'Seek mentorship opportunities',
          'Transition to full-time role'
        ],
        industryTrends: [
          'AI and Machine Learning skills in high demand',
          'Remote work opportunities increasing',
          'Full-stack development skills valued',
          'Data analysis becoming essential'
        ],
        skillDemand: [
          { skill: 'JavaScript', demand: 95 },
          { skill: 'Python', demand: 88 },
          { skill: 'React', demand: 82 },
          { skill: 'Data Analysis', demand: 78 },
          { skill: 'UI/UX Design', demand: 75 }
        ],
        salaryInsights: {
          averageSalary: 'KSh 45,000/month',
          salaryRange: 'KSh 25,000 - KSh 80,000',
          location: 'Nairobi, Kenya'
        }
      };
      setInsights(mockInsights);
      console.log('Using mock AI insights data');
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    insights,
    loading,
    error,
    analyzeProfile,
    generateMatches,
    getInsights
  };
};