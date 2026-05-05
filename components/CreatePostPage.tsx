
import React from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PostComposer } from './PostComposer';

interface CreatePostPageProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({ userRole, onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('HOME')}
          className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Feed
        </button>
        <h1 className="text-xl font-black text-black tracking-tight flex items-center gap-2 uppercase">
          <Sparkles className="w-5 h-5 text-[#facc15]" /> Create Update
        </h1>
      </div>

      <div className="space-y-6">
        <div className="bg-[#facc15]/10 border border-[#facc15]/30 rounded-xl p-4">
          <p className="text-[10px] font-black text-black uppercase tracking-tight leading-relaxed">
            💡 Strategy: {userRole === UserRole.STUDENT 
              ? 'Feature your process or key learnings to attract specific organizations.' 
              : 'Detailed updates about your org culture increase high-intent candidate matches.'}
          </p>
        </div>

        <div className="shadow-2xl rounded-xl">
          <PostComposer userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
