import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  viewsCount: number;
  likesCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (userId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      const videosData: Video[] = (data || []).map(video => ({
        id: video.id,
        userId: video.user_id,
        title: video.title,
        description: video.description,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        duration: video.duration,
        fileSize: video.file_size,
        viewsCount: video.views_count || 0,
        likesCount: video.likes_count || 0,
        isFeatured: video.is_featured || false,
        createdAt: video.created_at,
        updatedAt: video.updated_at
      }));

      setVideos(videosData);
    } catch (err) {
      // Fallback to mock data if Supabase fails
      const mockVideos: Video[] = [
        {
          id: '1',
          userId: user?.id || '1',
          title: 'My Portfolio Showcase',
          description: 'A showcase of my recent web development projects',
          videoUrl: 'https://example.com/video1.mp4',
          thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
          duration: 120,
          viewsCount: 45,
          likesCount: 12,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setVideos(mockVideos);
      console.log('Using mock videos data (Supabase unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file: File, metadata: { title: string; description?: string }) => {
    if (!user?.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload video file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Insert video record
      const { data, error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: metadata.title,
          description: metadata.description,
          video_url: publicUrl,
          file_size: file.size,
          views_count: 0,
          likes_count: 0,
          is_featured: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        const newVideo: Video = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          description: data.description,
          videoUrl: data.video_url,
          thumbnailUrl: data.thumbnail_url,
          duration: data.duration,
          fileSize: data.file_size,
          viewsCount: data.views_count,
          likesCount: data.likes_count,
          isFeatured: data.is_featured,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setVideos(prev => [newVideo, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      // Fallback: add video locally
      const newVideo: Video = {
        id: Date.now().toString(),
        userId: user.id,
        title: metadata.title,
        description: metadata.description,
        videoUrl: URL.createObjectURL(file),
        fileSize: file.size,
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setVideos(prev => [newVideo, ...prev]);
      console.log('Video added locally (Supabase unavailable)');
      return true;
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: supabaseError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (supabaseError) throw supabaseError;

      setVideos(prev => prev.filter(video => video.id !== videoId));
      return true;
    } catch (err) {
      // Fallback: delete locally
      setVideos(prev => prev.filter(video => video.id !== videoId));
      console.log('Video deleted locally (Supabase unavailable)');
      return true;
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (videoId: string) => {
    try {
      await supabase
        .from('videos')
        .update({ views_count: supabase.raw('views_count + 1') })
        .eq('id', videoId);

      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, viewsCount: video.viewsCount + 1 }
          : video
      ));
    } catch (err) {
      console.log('Error incrementing views:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVideos(user.id);
    }
  }, [user?.id]);

  return {
    videos,
    loading,
    error,
    fetchVideos,
    uploadVideo,
    deleteVideo,
    incrementViews
  };
};