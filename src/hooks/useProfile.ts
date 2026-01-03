import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  skills: Array<{name: string, description: string}>;
  experience?: string;
  education?: string;
  preferences?: {
    workType: 'remote' | 'onsite' | 'hybrid';
    salaryRange: string;
    industries: string[];
  };
  profilePicture?: string;
  cvUrl?: string;
  cvUploadedAt?: string;
  completionScore?: number;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First try to get existing profile
      let { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      // If no profile exists, create one
      if (supabaseError && supabaseError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.userType,
            skills: [],
            preferences: {
              workType: 'hybrid',
              salaryRange: '',
              industries: []
            },
            completion_score: 25
          })
          .select()
          .single();

        if (createError) throw createError;
        data = newProfile;
      } else if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        const profileData: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          userType: data.user_type,
          bio: data.bio,
          location: data.location,
          phone: data.phone,
          website: data.website,
          skills: data.skills || [],
          experience: data.experience,
          education: data.education,
          preferences: data.preferences || {
            workType: 'hybrid',
            salaryRange: '',
            industries: []
          },
          profilePicture: data.profile_picture,
          cvUrl: data.cv_url,
          cvUploadedAt: data.cv_uploaded_at,
          completionScore: data.completion_score
        };
        setProfile(profileData);
      }
    } catch (err) {
      // Fallback to mock profile if Supabase fails
      const mockProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        bio: 'Passionate about technology and career development.',
        location: 'Nairobi, Kenya',
        skills: [
          { name: 'JavaScript', description: '3 years of experience' },
          { name: 'Python', description: 'Data analysis and automation' },
          { name: 'React', description: 'Building modern web applications' },
          { name: 'UI/UX Design', description: 'User-centered design' }
        ],
        experience: '2 years of web development experience',
        education: "Bachelor's in Computer Science",
        preferences: {
          workType: 'hybrid',
          salaryRange: 'KSh 20,000 - 40,000',
          industries: ['Technology', 'Fintech']
        },
        completionScore: 85
      };
      setProfile(mockProfile);
      console.log('Using mock profile data (Supabase unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          website: profileData.website,
          skills: profileData.skills,
          experience: profileData.experience,
          education: profileData.education,
          preferences: profileData.preferences,
          profile_picture: profileData.profilePicture,
          completion_score: profileData.completionScore,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
        const updatedProfile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          userType: data.user_type,
          bio: data.bio,
          location: data.location,
          phone: data.phone,
          website: data.website,
          skills: data.skills,
          experience: data.experience,
          education: data.education,
          preferences: data.preferences,
          profilePicture: data.profile_picture,
          cvUrl: data.cv_url,
          cvUploadedAt: data.cv_uploaded_at,
          completionScore: data.completion_score
        };
        setProfile(updatedProfile);
        return true;
      }
      return false;
    } catch (err) {
      // Fallback: update profile locally
      if (profile) {
        const updatedProfile = { ...profile, ...profileData };
        setProfile(updatedProfile);
        console.log('Profile updated locally (Supabase unavailable)');
        return true;
      }
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${authUser.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const success = await updateProfile({ profilePicture: publicUrl });
      return success;
    } catch (err) {
      const mockUrl = URL.createObjectURL(file);
      const success = await updateProfile({ profilePicture: mockUrl });
      console.log('Profile picture updated locally (Supabase unavailable)');
      return success;
    } finally {
      setLoading(false);
    }
  };

  const generateCV = async () => {
    if (!user?.id || !profile) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call a backend service
      // For now, we'll create a mock PDF download
      const cvContent = `
        CraftLab Professional CV
        
        Name: ${profile.name}
        Email: ${profile.email}
        Location: ${profile.location || 'Not specified'}
        
        Bio: ${profile.bio || 'No bio provided'}
        
        Skills:
        - Programming: ${profile.skills.programming.join(', ')}
        - Design: ${profile.skills.design.join(', ')}
        - Data: ${profile.skills.data.join(', ')}
        
        Experience: ${profile.experience || 'No experience listed'}
        Education: ${profile.education || 'No education listed'}
        
        Generated by CraftLab Career Platform
      `;
      
      const blob = new Blob([cvContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const uploadCV = async (file: File) => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${authUser.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          cv_url: publicUrl,
          cv_uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data && profile) {
        setProfile({
          ...profile,
          cvUrl: data.cv_url,
          cvUploadedAt: data.cv_uploaded_at
        });
      }
      return true;
    } catch (err) {
      const mockUrl = URL.createObjectURL(file);
      if (profile) {
        setProfile({
          ...profile,
          cvUrl: mockUrl,
          cvUploadedAt: new Date().toISOString()
        });
      }
      console.log('CV uploaded locally (Supabase unavailable)');
      return true;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadProfilePicture,
    uploadCV,
    generateCV
  };
};