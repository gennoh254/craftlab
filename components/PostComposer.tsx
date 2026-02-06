
import React, { useState, useRef } from 'react';
import {
  Image,
  Paperclip,
  Github,
  Globe,
  Eye,
  Lock,
  ChevronDown,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface PostComposerProps {
  userRole: UserRole;
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ userRole, onPostCreated }) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentPostTypes = [
    'Showcase', 'Skill Demo', 'Learning Update', 'Opportunity Request'
  ];

  const orgPostTypes = [
    'Update', 'Talent Call', 'Success Story', 'Event'
  ];

  const currentTypes = userRole === UserRole.STUDENT ? studentPostTypes : orgPostTypes;

  const getMediaType = (file: File): 'image' | 'video' | 'file' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview('');
    }
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${user!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('posts-media')
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !profile) return;

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (selectedFile) {
        mediaUrl = await uploadMedia(selectedFile);
        if (!mediaUrl) {
          setLoading(false);
          return;
        }
        mediaType = getMediaType(selectedFile);
      }

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          type: postType || currentTypes[0],
          title: title || 'Untitled Post',
          content: content.trim(),
          tags: tagsArray,
          visibility: visibility,
          media_url: mediaUrl,
          media_type: mediaType,
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTitle('');
        setContent('');
        setTags('');
        setPostType('');
        setSelectedFile(null);
        setMediaPreview('');

        setTimeout(() => setSuccess(false), 3000);

        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <img
          src={profile?.avatar_url || `https://picsum.photos/seed/${user?.id}/100`}
          className="w-10 h-10 rounded-full border-2 border-gray-100"
          alt="User"
        />
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {currentTypes.map(type => (
            <button
              key={type}
              onClick={() => setPostType(type)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest transition-all border whitespace-nowrap ${
                postType === type
                  ? 'bg-[#facc15] text-black border-[#facc15]'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-[#facc15] hover:text-black'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a title..."
          className="w-full text-base font-bold focus:outline-none placeholder:text-gray-400"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={userRole === UserRole.STUDENT ? "What project are you working on today?" : "Share a milestone or open role..."}
          className="w-full min-h-[100px] text-sm font-medium focus:outline-none resize-none placeholder:text-gray-400"
        />

        {mediaPreview && (
          <div className="relative rounded-lg overflow-hidden border-2 border-[#facc15] bg-gray-50">
            {selectedFile?.type.startsWith('image/') ? (
              <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
            ) : (
              <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
            )}
            <button
              onClick={() => {
                setSelectedFile(null);
                setMediaPreview('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-2 right-2 bg-black rounded-full p-1 hover:bg-gray-800"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {selectedFile && !mediaPreview && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-600">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g. React, Design, AI)"
          className="w-full text-xs font-medium focus:outline-none placeholder:text-gray-400 text-gray-600"
        />
      </div>

      {error && (
        <div className="px-4 pb-2">
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="px-4 pb-2">
          <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-bold text-green-600">Post published successfully!</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}
            disabled={uploading}
            className="text-gray-400 hover:text-black transition-colors disabled:opacity-50"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'video/*';
                fileInputRef.current.click();
              }
            }}
            disabled={uploading}
            className="text-gray-400 hover:text-black transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-black transition-colors"><Github className="w-5 h-5" /></button>
          <button className="text-gray-400 hover:text-black transition-colors"><Globe className="w-5 h-5" /></button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setVisibility(visibility === 'public' ? 'private' : 'public')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {visibility === 'public' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {visibility === 'public' ? 'Public' : 'Private'}
          </button>
          <button
            onClick={handlePublish}
            disabled={!content || loading}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
              content && !loading ? 'bg-black text-[#facc15] hover:bg-gray-900 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
