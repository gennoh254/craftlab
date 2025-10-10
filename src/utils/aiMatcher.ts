// AI-powered profile analysis and opportunity matching system
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: 'attachee' | 'intern' | 'apprentice' | 'volunteer' | 'organization';
  skills: {
    programming: string[];
    design: string[];
    data: string[];
    business: string[];
    marketing: string[];
  };
  experience: string;
  education: string;
  location: string;
  preferences: {
    workType: 'remote' | 'onsite' | 'hybrid';
    salaryRange: string;
    industries: string[];
  };
}

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
}

export class AIProfileMatcher {
  private static instance: AIProfileMatcher;
  
  public static getInstance(): AIProfileMatcher {
    if (!AIProfileMatcher.instance) {
      AIProfileMatcher.instance = new AIProfileMatcher();
    }
    return AIProfileMatcher.instance;
  }

  // Simulate AI analysis with sophisticated matching algorithm
  public analyzeProfile(profile: UserProfile): {
    strengths: string[];
    recommendations: string[];
    completionScore: number;
    skillGaps: string[];
  } {
    const allSkills = [
      ...profile.skills.programming,
      ...profile.skills.design,
      ...profile.skills.data,
      ...profile.skills.business || [],
      ...profile.skills.marketing || []
    ];

    const strengths = this.identifyStrengths(profile, allSkills);
    const recommendations = this.generateRecommendations(profile, allSkills);
    const completionScore = this.calculateCompletionScore(profile);
    const skillGaps = this.identifySkillGaps(profile, allSkills);

    return {
      strengths,
      recommendations,
      completionScore,
      skillGaps
    };
  }

  public matchOpportunities(profile: UserProfile, opportunities: Opportunity[]): Array<Opportunity & { matchScore: number; matchReasons: string[] }> {
    return opportunities.map(opportunity => {
      const matchResult = this.calculateMatch(profile, opportunity);
      return {
        ...opportunity,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  private identifyStrengths(profile: UserProfile, allSkills: string[]): string[] {
    const strengths: string[] = [];
    
    if (profile.skills.programming.length > 3) {
      strengths.push('Strong technical programming skills');
    }
    if (profile.skills.design.length > 2) {
      strengths.push('Creative design capabilities');
    }
    if (profile.skills.data.length > 2) {
      strengths.push('Data analysis and insights');
    }
    if (allSkills.length > 8) {
      strengths.push('Diverse skill set across multiple domains');
    }

    // Add user type specific strengths
    switch (profile.userType) {
      case 'attachee':
        strengths.push('Academic foundation ready for practical application');
        break;
      case 'intern':
        strengths.push('Eager to learn and gain professional experience');
        break;
      case 'apprentice':
        strengths.push('Hands-on learning approach and practical skills');
        break;
      case 'volunteer':
        strengths.push('Community-minded with strong social impact focus');
        break;
    }

    return strengths;
  }

  private generateRecommendations(profile: UserProfile, allSkills: string[]): string[] {
    const recommendations: string[] = [];

    // Skill-based recommendations
    if (profile.skills.programming.length > 0 && !profile.skills.programming.includes('React')) {
      recommendations.push('Consider learning React for modern web development');
    }
    if (profile.skills.data.length > 0 && !profile.skills.data.includes('Python')) {
      recommendations.push('Add Python to your data analysis toolkit');
    }
    if (allSkills.length < 5) {
      recommendations.push('Expand your skill set to increase opportunities');
    }

    // User type specific recommendations
    switch (profile.userType) {
      case 'attachee':
        recommendations.push('Focus on building practical project experience');
        recommendations.push('Consider industry-specific certifications');
        break;
      case 'intern':
        recommendations.push('Build a strong portfolio showcasing your projects');
        recommendations.push('Network with professionals in your field');
        break;
      case 'apprentice':
        recommendations.push('Seek mentorship opportunities');
        recommendations.push('Document your hands-on learning journey');
        break;
      case 'volunteer':
        recommendations.push('Highlight your community impact and leadership');
        recommendations.push('Consider skills-based volunteering opportunities');
        break;
    }

    return recommendations;
  }

  private calculateCompletionScore(profile: UserProfile): number {
    let score = 0;
    const maxScore = 100;

    // Basic info (20 points)
    if (profile.name) score += 5;
    if (profile.email) score += 5;
    if (profile.userType) score += 10;

    // Skills (40 points)
    const totalSkills = Object.values(profile.skills).flat().length;
    score += Math.min(totalSkills * 4, 40);

    // Experience and education (20 points)
    if (profile.experience) score += 10;
    if (profile.education) score += 10;

    // Preferences (20 points)
    if (profile.location) score += 5;
    if (profile.preferences?.workType) score += 5;
    if (profile.preferences?.salaryRange) score += 5;
    if (profile.preferences?.industries?.length > 0) score += 5;

    return Math.min(score, maxScore);
  }

  private identifySkillGaps(profile: UserProfile, allSkills: string[]): string[] {
    const gaps: string[] = [];
    const commonSkills = ['Communication', 'Teamwork', 'Problem Solving', 'Time Management'];
    
    commonSkills.forEach(skill => {
      if (!allSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        gaps.push(skill);
      }
    });

    // Industry-specific gaps
    if (profile.skills.programming.length > 0) {
      const techSkills = ['Git', 'Testing', 'Agile', 'Cloud Computing'];
      techSkills.forEach(skill => {
        if (!allSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
          gaps.push(skill);
        }
      });
    }

    return gaps.slice(0, 5); // Return top 5 gaps
  }

  private calculateMatch(profile: UserProfile, opportunity: Opportunity): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // User type compatibility (25 points)
    const typeMatch = this.getTypeCompatibility(profile.userType, opportunity.type);
    score += typeMatch.score;
    if (typeMatch.score > 15) {
      reasons.push(typeMatch.reason);
    }

    // Skills match (35 points)
    const skillsMatch = this.calculateSkillsMatch(profile, opportunity);
    score += skillsMatch.score;
    reasons.push(...skillsMatch.reasons);

    // Location preference (15 points)
    if (profile.location && opportunity.location.includes(profile.location)) {
      score += 15;
      reasons.push('Location matches your preference');
    } else if (opportunity.workType === 'remote' || opportunity.workType === 'hybrid') {
      score += 10;
      reasons.push('Offers flexible work arrangement');
    }

    // Work type preference (15 points)
    if (profile.preferences?.workType === opportunity.workType) {
      score += 15;
      reasons.push('Work type matches your preference');
    }

    // Industry match (10 points)
    if (profile.preferences?.industries?.includes(opportunity.industry)) {
      score += 10;
      reasons.push('Industry aligns with your interests');
    }

    return {
      score: Math.min(score, maxScore),
      reasons: reasons.slice(0, 4) // Top 4 reasons
    };
  }

  private getTypeCompatibility(userType: string, opportunityType: string): { score: number; reason: string } {
    const compatibility: Record<string, Record<string, { score: number; reason: string }>> = {
      attachee: {
        attachment: { score: 25, reason: 'Perfect match for industrial attachment' },
        internship: { score: 20, reason: 'Great opportunity for practical experience' },
        apprenticeship: { score: 15, reason: 'Good for hands-on learning' },
        volunteer: { score: 10, reason: 'Valuable for community experience' },
        'full-time': { score: 5, reason: 'Consider after gaining more experience' }
      },
      intern: {
        internship: { score: 25, reason: 'Perfect internship opportunity' },
        attachment: { score: 20, reason: 'Excellent for gaining experience' },
        apprenticeship: { score: 15, reason: 'Good for skill development' },
        volunteer: { score: 12, reason: 'Great for building portfolio' },
        'full-time': { score: 8, reason: 'Future career opportunity' }
      },
      apprentice: {
        apprenticeship: { score: 25, reason: 'Ideal apprenticeship program' },
        internship: { score: 18, reason: 'Good for structured learning' },
        attachment: { score: 15, reason: 'Practical experience opportunity' },
        volunteer: { score: 10, reason: 'Community engagement experience' },
        'full-time': { score: 12, reason: 'Potential career path' }
      },
      volunteer: {
        volunteer: { score: 25, reason: 'Perfect volunteer opportunity' },
        internship: { score: 15, reason: 'Professional development opportunity' },
        apprenticeship: { score: 12, reason: 'Skill-building opportunity' },
        attachment: { score: 10, reason: 'Academic credit opportunity' },
        'full-time': { score: 8, reason: 'Consider for career transition' }
      }
    };

    return compatibility[userType]?.[opportunityType] || { score: 5, reason: 'General opportunity match' };
  }

  private calculateSkillsMatch(profile: UserProfile, opportunity: Opportunity): { score: number; reasons: string[] } {
    const userSkills = [
      ...profile.skills.programming,
      ...profile.skills.design,
      ...profile.skills.data,
      ...profile.skills.business || [],
      ...profile.skills.marketing || []
    ].map(s => s.toLowerCase());

    const requiredSkills = opportunity.requirements.skills.map(s => s.toLowerCase());
    const matchedSkills: string[] = [];
    
    requiredSkills.forEach(reqSkill => {
      const match = userSkills.find(userSkill => 
        userSkill.includes(reqSkill) || reqSkill.includes(userSkill)
      );
      if (match) {
        matchedSkills.push(reqSkill);
      }
    });

    const matchPercentage = requiredSkills.length > 0 ? 
      (matchedSkills.length / requiredSkills.length) * 100 : 50;
    
    const score = Math.min((matchPercentage / 100) * 35, 35);
    const reasons: string[] = [];

    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} of ${requiredSkills.length} required skills match`);
    }
    if (matchPercentage >= 80) {
      reasons.push('Excellent skills alignment');
    } else if (matchPercentage >= 60) {
      reasons.push('Good skills match');
    } else if (matchPercentage >= 40) {
      reasons.push('Moderate skills overlap');
    }

    return { score, reasons };
  }

  // Generate sample opportunities for demonstration
  public generateSampleOpportunities(): Opportunity[] {
    return [
      {
        id: '1',
        title: 'Software Development Internship',
        company: 'TechCorp Kenya',
        location: 'Nairobi, Kenya',
        type: 'internship',
        salary: 'KSh 25,000/month',
        deadline: 'Dec 31, 2024',
        description: 'Join our development team to build cutting-edge web applications using modern technologies.',
        requirements: {
          skills: ['JavaScript', 'React', 'Node.js', 'Git'],
          experience: 'Basic programming knowledge',
          education: 'Computer Science or related field'
        },
        benefits: ['Mentorship', 'Flexible hours', 'Learning opportunities', 'Certificate'],
        workType: 'hybrid',
        industry: 'Technology'
      },
      {
        id: '2',
        title: 'Digital Marketing Volunteer',
        company: 'NGO Impact',
        location: 'Remote',
        type: 'volunteer',
        salary: 'Volunteer',
        deadline: 'Jan 15, 2025',
        description: 'Help us create impactful digital campaigns for social causes.',
        requirements: {
          skills: ['Social Media', 'Content Creation', 'Analytics'],
          experience: 'Basic marketing knowledge',
          education: 'Any field'
        },
        benefits: ['Social impact', 'Portfolio building', 'Networking', 'Reference letter'],
        workType: 'remote',
        industry: 'Non-profit'
      },
      {
        id: '3',
        title: 'Data Analysis Attachment',
        company: 'Analytics Plus',
        location: 'Mombasa, Kenya',
        type: 'attachment',
        salary: 'KSh 20,000/month',
        deadline: 'Jan 20, 2025',
        description: 'Work with our data science team to analyze business metrics and create insights.',
        requirements: {
          skills: ['Python', 'SQL', 'Excel', 'Statistics'],
          experience: 'Academic data analysis projects',
          education: 'Statistics, Mathematics, or Computer Science'
        },
        benefits: ['Real-world experience', 'Industry exposure', 'Mentorship', 'Job opportunity'],
        workType: 'onsite',
        industry: 'Analytics'
      },
      {
        id: '4',
        title: 'UI/UX Design Apprenticeship',
        company: 'Creative Studio',
        location: 'Nairobi, Kenya',
        type: 'apprenticeship',
        salary: 'KSh 30,000/month',
        deadline: 'Feb 1, 2025',
        description: 'Learn design thinking and create user-centered digital experiences.',
        requirements: {
          skills: ['Figma', 'Adobe Creative Suite', 'Design Thinking'],
          experience: 'Portfolio of design work',
          education: 'Design or related field'
        },
        benefits: ['Hands-on training', 'Portfolio development', 'Industry connections', 'Certification'],
        workType: 'hybrid',
        industry: 'Design'
      },
      {
        id: '5',
        title: 'Business Development Internship',
        company: 'StartupHub',
        location: 'Nairobi, Kenya',
        type: 'internship',
        salary: 'KSh 22,000/month',
        deadline: 'Jan 30, 2025',
        description: 'Support our business development team in market research and client acquisition.',
        requirements: {
          skills: ['Market Research', 'Communication', 'Excel', 'Presentation'],
          experience: 'Business or sales interest',
          education: 'Business, Economics, or related field'
        },
        benefits: ['Startup experience', 'Networking', 'Sales training', 'Performance bonus'],
        workType: 'onsite',
        industry: 'Business'
      },
      {
        id: '6',
        title: 'Community Outreach Volunteer',
        company: 'Youth Empowerment Kenya',
        location: 'Kisumu, Kenya',
        type: 'volunteer',
        salary: 'Volunteer + Transport',
        deadline: 'Feb 15, 2025',
        description: 'Engage with local communities to promote youth development programs.',
        requirements: {
          skills: ['Communication', 'Community Engagement', 'Event Planning'],
          experience: 'Community service experience preferred',
          education: 'Any field'
        },
        benefits: ['Community impact', 'Leadership skills', 'Cultural exposure', 'Certificate'],
        workType: 'onsite',
        industry: 'Non-profit'
      }
    ];
  }
}

export default AIProfileMatcher;