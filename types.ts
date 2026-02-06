
export enum UserRole {
  STUDENT = 'STUDENT',
  ORGANIZATION = 'ORGANIZATION'
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorVerified: boolean;
  type: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  timestamp: string;
  isPublic: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface Opportunity {
  id: string;
  orgName: string;
  role: string;
  type: 'Internship' | 'Attachment' | 'Apprenticeship' | 'Volunteer';
  matchScore: number;
  timeline: string;
  hoursPerWeek: number;
  fit: 'Fits' | 'Partial' | 'Gaps';
  gaps: string[];
}

export interface CandidateMatch {
  id: string;
  name: string;
  score: number;
  institution: string;
  status: 'Fits' | 'Partial' | 'Gaps';
  avatar: string;
  seeking: string[];
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: string;
  category: 'Bachelors' | 'Diploma' | 'Masters' | 'PhD' | 'Certification' | 'Certificate';
  proofImageUrl?: string;
}

export interface DbOpportunity {
  id: string;
  org_id: string;
  role: string;
  type: 'Internship' | 'Attachment' | 'Apprenticeship' | 'Volunteer';
  description: string;
  skills_required: string;
  start_date: string | null;
  work_mode: 'Remote' | 'On-site' | 'Hybrid' | null;
  hours_per_week: number | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    avatar_url: string | null;
  };
}
