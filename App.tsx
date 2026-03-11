
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
import SearchResults from './components/SearchResults';
import UserProfileView from './components/UserProfileView';
import AuthPage from './components/AuthPage';
import { UserRole } from './types';
import { useAuth } from './lib/auth';

export type ViewState =
  | 'HOME'
  | 'DASHBOARD'
  | 'NETWORK'
  | 'JOBS'
  | 'INBOX'
  | 'EDIT_PROFILE'
  | 'CREATE_POST'
  | 'POST_OPPORTUNITY'
  | 'VIEW_MATCHES'
  | 'ALL_OPPORTUNITIES'
  | 'SEARCH'
  | 'VIEW_USER';

const App: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeView, setActiveView] = useState<ViewState>('HOME');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleViewChange = (view: ViewState, query?: string, userId?: string) => {
    if (query) {
      setSearchQuery(query);
    }
    if (userId) {
      setSelectedUserId(userId);
    }
    setActiveView(view);
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
        return <HomeFeed userRole={currentUserRole} onNavigate={setActiveView} />;
      case 'DASHBOARD':
        return currentUserRole === UserRole.STUDENT ? (
          <StudentDashboard onNavigate={setActiveView} />
        ) : (
          <OrgDashboard onNavigate={setActiveView} />
        );
      case 'INBOX':
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
        return <OpportunitiesPage userRole={currentUserRole} />;
      case 'SEARCH':
        return <SearchResults query={searchQuery} userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'VIEW_USER':
        return selectedUserId ? <UserProfileView userId={selectedUserId} onNavigate={handleViewChange} /> : null;
      default:
        return <HomeFeed userRole={currentUserRole} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Header
        userRole={currentUserRole}
        activeView={activeView}
        onViewChange={handleViewChange}
        profile={profile}
      />

      <main className="max-w-7xl mx-auto px-4 pt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
