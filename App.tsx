
import React, { useState } from 'react';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import OrgDashboard from './components/OrgDashboard';
import HomeFeed from './components/HomeFeed';
import Messaging from './components/Messaging';
import EditProfile from './components/EditProfile';
import CreatePostPage from './components/CreatePostPage';
import PostOpportunityPage from './components/PostOpportunityPage';
import ViewMatchesPage from './components/ViewMatchesPage';
import OpportunitiesPage from './components/OpportunitiesPage';
import PostDetailPage from './components/PostDetailPage';
import AuthPage from './components/AuthPage';
import { UserRole, Post } from './types';
import { useAuth } from './lib/auth';

export type ViewState =
  | 'HOME'
  | 'DASHBOARD'
  | 'NETWORK'
  | 'JOBS'
  | 'MESSAGES'
  | 'EDIT_PROFILE'
  | 'CREATE_POST'
  | 'POST_OPPORTUNITY'
  | 'VIEW_MATCHES'
  | 'ALL_OPPORTUNITIES'
  | 'POST_DETAIL';

const App: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeView, setActiveView] = useState<ViewState>('HOME');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    setActiveView('POST_DETAIL');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#facc15] rounded-2xl mx-auto flex items-center justify-center font-black text-black text-2xl animate-pulse">
            CC
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  const currentUserRole = profile.user_type === 'STUDENT' ? UserRole.STUDENT : UserRole.ORGANIZATION;

  const renderContent = () => {
    switch (activeView) {
      case 'HOME':
        return <HomeFeed userRole={currentUserRole} onNavigate={setActiveView} onViewPost={handleViewPost} />;
      case 'DASHBOARD':
        return currentUserRole === UserRole.STUDENT ? (
          <StudentDashboard onNavigate={setActiveView} />
        ) : (
          <OrgDashboard onNavigate={setActiveView} />
        );
      case 'MESSAGES':
        return <Messaging userRole={currentUserRole} />;
      case 'EDIT_PROFILE':
        return <EditProfile userRole={currentUserRole} onNavigate={setActiveView} />;
      case 'CREATE_POST':
        return <CreatePostPage userRole={currentUserRole} onNavigate={setActiveView} />;
      case 'POST_OPPORTUNITY':
        return <PostOpportunityPage userRole={currentUserRole} onNavigate={setActiveView} />;
      case 'VIEW_MATCHES':
        return <ViewMatchesPage userRole={currentUserRole} onNavigate={setActiveView} />;
      case 'ALL_OPPORTUNITIES':
        return <OpportunitiesPage userRole={currentUserRole} onNavigate={setActiveView} />;
      case 'POST_DETAIL':
        return selectedPost ? <PostDetailPage post={selectedPost} userRole={currentUserRole} onNavigate={setActiveView} /> : null;
      default:
        return <HomeFeed userRole={currentUserRole} onNavigate={setActiveView} onViewPost={handleViewPost} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Header
        userRole={currentUserRole}
        activeView={activeView}
        onViewChange={setActiveView}
        profile={profile}
      />

      <main className="max-w-7xl mx-auto px-4 pt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
