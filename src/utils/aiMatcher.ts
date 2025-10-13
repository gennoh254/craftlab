// AI-powered profile analysis and opportunity matching system
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: 'attachee' | 'intern' | 'apprentice' | 'volunteer' | 'organization';
  skills: {
    programming: Array<string | {name: string, description: string}>;
    design: Array<string | {name: string, description: string}>;
    data: Array<string | {name: string, description: string}>;
    business: Array<string | {name: string, description: string}>;
    marketing: Array<string | {name: string, description: string}>;
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

  private extractSkillNames(skills: Array<string | {name: string, description: string}>): string[] {
    return skills.map(skill => typeof skill === 'string' ? skill : skill.name);
  }

  // Simulate AI analysis with sophisticated matching algorithm
  public analyzeProfile(profile: UserProfile): {
    strengths: string[];
    recommendations: string[];
    completionScore: number;
    skillGaps: string[];
  } {
    const allSkills = [
      ...this.extractSkillNames(profile.skills.programming),
      ...this.extractSkillNames(profile.skills.design),
      ...this.extractSkillNames(profile.skills.data),
      ...this.extractSkillNames(profile.skills.business || []),
      ...this.extractSkillNames(profile.skills.marketing || [])
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

    if (this.extractSkillNames(profile.skills.programming).length > 3) {
      strengths.push('Strong technical programming skills');
    }
    if (this.extractSkillNames(profile.skills.design).length > 2) {
      strengths.push('Creative design capabilities');
    }
    if (this.extractSkillNames(profile.skills.data).length > 2) {
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

    const programmingSkills = this.extractSkillNames(profile.skills.programming);
    const dataSkills = this.extractSkillNames(profile.skills.data);

    // Skill-based recommendations
    if (programmingSkills.length > 0 && !programmingSkills.some(s => s.toLowerCase().includes('react'))) {
      recommendations.push('Consider learning React for modern web development');
    }
    if (dataSkills.length > 0 && !dataSkills.some(s => s.toLowerCase().includes('python'))) {
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
    const programmingSkills = this.extractSkillNames(profile.skills.programming);
    if (programmingSkills.length > 0) {
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
      ...this.extractSkillNames(profile.skills.programming),
      ...this.extractSkillNames(profile.skills.design),
      ...this.extractSkillNames(profile.skills.data),
      ...this.extractSkillNames(profile.skills.business || []),
      ...this.extractSkillNames(profile.skills.marketing || [])
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

}

export default AIProfileMatcher;