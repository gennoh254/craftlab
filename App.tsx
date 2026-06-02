
import React, { useState } from 'react';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import OrgDashboard from './components/OrgDashboard';
import FeedPage from './components/FeedPage';
import Messaging from './components/Messaging';
import EditProfile from './components/EditProfile';
import CreatePostPage from './components/CreatePostPage';
import PostOpportunityPage from './components/PostOpportunityPage';
import ViewMatchesPage from './components/ViewMatchesPage';
import OpportunitiesPage from './components/OpportunitiesPage';
import SearchResults from './components/SearchResults';
import UserProfileView from './components/UserProfileView';
import AuthPage from './components/AuthPage';
import LandingHomePage from './components/LandingHomePage';
import { UserRole } from './types';
import { useAuth } from './lib/auth';

export type ViewState =
  | 'HOME'
  | 'FEED'
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
    return (
      <div className="min-h-screen pb-12">
        <div className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-[#facc15]/30 z-50 px-4 shadow-md">
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="w-8 h-8 bg-[#facc15] rounded-lg flex items-center justify-center">
                  <span className="font-black text-black text-xs">CC</span>
                </div>
              </div>
              <span className="font-bold text-lg text-black select-none">CraftLab-Careers</span>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 pt-20">
          <LandingHomePage onNavigate={(view) => {
            if (view === 'ALL_OPPORTUNITIES') {
              // All non-home navigations from unauthenticated landing page go to signup
            }
          }} />
        </main>
      </div>
    );
  }

  const currentUserRole = profile.user_type === 'STUDENT' ? UserRole.STUDENT : UserRole.ORGANIZATION;

  const renderContent = () => {
    switch (activeView) {
      case 'HOME':
        return <LandingHomePage onNavigate={handleViewChange} />;
      case 'FEED':
        return <FeedPage userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'DASHBOARD':
        return currentUserRole === UserRole.STUDENT ? (
          <StudentDashboard onNavigate={handleViewChange} />
        ) : (
          <OrgDashboard onNavigate={handleViewChange} />
        );
      case 'INBOX':
        return <Messaging userRole={currentUserRole} />;
      case 'EDIT_PROFILE':
        return <EditProfile userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'CREATE_POST':
        return <CreatePostPage userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'POST_OPPORTUNITY':
        return <PostOpportunityPage userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'VIEW_MATCHES':
        return <ViewMatchesPage userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'ALL_OPPORTUNITIES':
        return <OpportunitiesPage userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'SEARCH':
        return <SearchResults query={searchQuery} userRole={currentUserRole} onNavigate={handleViewChange} />;
      case 'VIEW_USER':
        return selectedUserId ? <UserProfileView userId={selectedUserId} onNavigate={handleViewChange} /> : null;
      default:
        return <LandingHomePage onNavigate={handleViewChange} />;
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
