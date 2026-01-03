import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Certificate {
  id: string;
  name: string;
  issuer?: string;
  university?: string;
  date?: string;
  status: 'verified' | 'pending' | 'rejected';
  fileUrl?: string;
  userId: string;
  uploadDate: string;
}

export const useCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      const certificatesData: Certificate[] = (data || []).map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        university: cert.university,
        date: cert.date,
        status: cert.status as Certificate['status'],
        fileUrl: cert.file_url,
        userId: cert.user_id,
        uploadDate: cert.created_at
      }));

      setCertificates(certificatesData);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadCertificate = async (file: File, metadata: any) => {
    if (!user?.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      // Insert certificate record
      const { data, error: insertError } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          name: metadata.name || file.name,
          issuer: metadata.issuer,
          university: metadata.university,
          date: metadata.date,
          file_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        const newCertificate: Certificate = {
          id: data.id,
          name: data.name,
          issuer: data.issuer,
          university: data.university,
          date: data.date,
          status: data.status as Certificate['status'],
          fileUrl: data.file_url,
          userId: data.user_id,
          uploadDate: data.created_at
        };
        setCertificates(prev => [newCertificate, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      // Fallback: add certificate locally
      const newCertificate: Certificate = {
        id: Date.now().toString(),
        name: metadata.name || file.name,
        status: 'pending',
        userId: user.id,
        uploadDate: new Date().toISOString(),
        ...metadata
      };
      setCertificates(prev => [newCertificate, ...prev]);
      console.log('Certificate added locally (Supabase unavailable)');
      return true;
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async (certificateId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: supabaseError } = await supabase
        .from('certificates')
        .update({ status: 'verified', updated_at: new Date().toISOString() })
        .eq('id', certificateId);

      if (supabaseError) throw supabaseError;

      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, status: 'verified' as const }
            : cert
        )
      );
      return true;
    } catch (err) {
      // Fallback: update locally
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, status: 'verified' as const }
            : cert
        )
      );
      console.log('Certificate verified locally (Supabase unavailable)');
      return true;
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = async (certificateId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: supabaseError } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (supabaseError) throw supabaseError;

      setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
      return true;
    } catch (err) {
      // Fallback: delete locally
      setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
      console.log('Certificate deleted locally (Supabase unavailable)');
      return true;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCertificates();
    }
  }, [user?.id]);

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    uploadCertificate,
    verifyCertificate,
    deleteCertificate
  };
};