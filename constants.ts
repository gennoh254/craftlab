
import { Post, UserRole, Opportunity, CandidateMatch, Certificate } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorId: 'a1',
    authorName: 'Innovate Labs',
    authorAvatar: 'https://picsum.photos/seed/lab/100',
    authorRole: UserRole.ORGANIZATION,
    authorVerified: true,
    type: 'Update',
    title: 'Future of Spatial UI - Breakthrough Update',
    content: 'Our R&D team just finalized the new gesture-control protocol for the upcoming XR headset. We are looking for talented UX interns who are passionate about non-traditional interfaces. Check our talent call!',
    tags: ['XR', 'UIUX', 'Innovation', 'FutureTech'],
    likes: 124,
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Sarah Chen', content: 'This looks incredible! Would love to see more about the research process.', timestamp: '2h ago' },
      { id: 'c2', userId: 'u2', userName: 'Mike Ross', content: 'Gesture controls are the future. Amazing work team.', timestamp: '1h ago' }
    ],
    timestamp: '2h ago',
    isPublic: true
  },
  {
    id: '2',
    authorId: 'a2',
    authorName: 'Alex Rivers',
    authorAvatar: 'https://picsum.photos/seed/alex/100',
    authorRole: UserRole.STUDENT,
    authorVerified: true,
    type: 'Showcase',
    title: 'Project Alpha: Redesigning Community Spaces',
    content: 'Just wrapped up my latest project focusing on how digital twins can improve physical community centers. Used a mix of React, ThreeJS, and massive amounts of user feedback data.',
    tags: ['Portfolio', 'React', 'ThreeJS', 'UrbanDesign'],
    likes: 89,
    comments: [],
    timestamp: '5h ago',
    isPublic: true
  }
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1',
    title: 'B.S. Interaction Design',
    issuer: 'Tech University',
    year: '2024',
    category: 'Bachelors',
    proofImageUrl: 'https://picsum.photos/seed/cert1/400/300'
  },
  {
    id: 'cert2',
    title: 'Professional UI/UX Specialist',
    issuer: 'Google Career Certs',
    year: '2023',
    category: 'Certification',
    proofImageUrl: 'https://picsum.photos/seed/cert2/400/300'
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1',
    orgName: 'Meta Design Lab',
    role: 'Product Design Intern',
    type: 'Internship',
    matchScore: 98,
    timeline: 'Sept - Dec',
    hoursPerWeek: 20,
    fit: 'Fits',
    gaps: ['Micro-interactions']
  }
];

export const MOCK_CANDIDATES: CandidateMatch[] = [
  { id: 'c1', name: 'Sarah Miller', score: 94, institution: 'Stanford', status: 'Fits', avatar: 'Sarah', seeking: ['Internship', 'Volunteer'] },
  { id: 'c2', name: 'David Kim', score: 88, institution: 'Berkeley', status: 'Partial', avatar: 'David', seeking: ['Apprenticeship'] }
];
