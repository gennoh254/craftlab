
import React, { useState, useRef } from 'react';
import { UserRole, Certificate } from '../types';
import { ViewState } from '../App';
import {
  ArrowLeft,
  Save,
  Camera,
  Award,
  Sparkles,
  Plus,
  Image as ImageIcon,
  X,
  Check,
  Cpu,
  RefreshCw,
  FileText,
  Heart,
  Loader2
} from 'lucide-react';
import { MOCK_CERTIFICATES } from '../constants';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface EditProfileProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userRole, onNavigate }) => {
  const { user, profile } = useAuth();
  const [showAddCert, setShowAddCert] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [isBuilding, setIsBuilding] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || '');
  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBuildCv = () => {
    setIsBuilding(true);
    setTimeout(() => setIsBuilding(false), 2000);
  };

  const uploadFile = async (file: File, bucket: 'avatars' | 'banners'): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
      return null;
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Avatar must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Avatar must be an image file');
      return;
    }

    setUploading('avatar');
    setError('');

    const url = await uploadFile(file, 'avatars');
    if (url) {
      setAvatarUrl(url);
    }

    setUploading(null);
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Banner must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Banner must be an image file');
      return;
    }

    setUploading('banner');
    setError('');

    const url = await uploadFile(file, 'banners');
    if (url) {
      setBannerUrl(url);
    }

    setUploading(null);
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-black text-black tracking-tighter uppercase">Profile Configuration</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-bold text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden">
        <div className="h-40 bg-black relative overflow-hidden">
          {bannerUrl && (
            <img src={bannerUrl} className="w-full h-full object-cover opacity-70" alt="Banner" />
          )}
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploading === 'banner'}
            className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {uploading === 'banner' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" /> Change Banner
              </>
            )}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
          />
          <div className="absolute -bottom-12 left-10 p-2 bg-white rounded-3xl shadow-xl">
             <div className="relative group cursor-pointer">
               <img
                 src={avatarUrl || `https://picsum.photos/seed/${user?.id}/150`}
                 className="w-32 h-32 rounded-2xl object-cover"
                 alt="Profile"
               />
               <button
                 onClick={() => avatarInputRef.current?.click()}
                 disabled={uploading === 'avatar'}
                 className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
               >
                  {uploading === 'avatar' ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
               </button>
               <input
                 ref={avatarInputRef}
                 type="file"
                 accept="image/*"
                 onChange={handleAvatarChange}
                 className="hidden"
               />
             </div>
          </div>
        </div>

        <div className="pt-20 p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 pb-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#facc15] bg-black px-2 py-0.5 rounded uppercase tracking-[0.2em] inline-block">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-2 text-4xl font-black text-black focus:outline-none focus:border-[#facc15] transition-all placeholder:text-gray-300 tracking-tighter"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Professional Title</label>
              <input
                type="text"
                defaultValue={userRole === UserRole.STUDENT ? "Senior UX Specialist" : "Pioneering Future Tech"}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-2 text-2xl font-bold text-gray-600 focus:outline-none focus:border-black transition-all"
                placeholder="Role or Specialty"
              />
            </div>
          </div>

          {userRole === UserRole.STUDENT && (
             <div className="space-y-16">
               <div className="space-y-6">
                 <h2 className="text-base font-black text-black uppercase tracking-widest flex items-center gap-3">
                   <Heart className="w-6 h-6 text-[#facc15]" /> Interests & Hobbies
                 </h2>
                 <textarea
                   rows={3}
                   placeholder="e.g. Generative Art, Sustainable Architecture, Distance Running..."
                   className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-black resize-none"
                   defaultValue="Digital illustration, spatial computing history, and urban exploration."
                 />
               </div>

               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                   <h2 className="text-base font-black text-black uppercase tracking-widest flex items-center gap-3">
                     <Award className="w-6 h-6 text-[#facc15]" /> Academic & Other Qualifications
                   </h2>
                   <button
                    onClick={() => setShowAddCert(true)}
                    className="px-5 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                   >
                     <Plus className="w-4 h-4" /> Add Qualification
                   </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {certificates.map(cert => (
                     <div key={cert.id} className="group p-6 bg-white rounded-3xl border-2 border-gray-50 space-y-4 relative hover:border-[#facc15] hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black bg-black text-[#facc15] px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">{cert.category}</span>
                            <h4 className="text-xl font-black text-black tracking-tighter">{cert.title}</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{cert.issuer} • {cert.year}</p>
                          </div>
                          <button className="text-gray-300 hover:text-red-500 transition-colors p-2"><X className="w-5 h-5" /></button>
                        </div>
                        {cert.proofImageUrl && (
                          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-100">
                            <img src={cert.proofImageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Proof" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-2 shadow-xl border border-gray-100">
                              <Check className="w-3.5 h-3.5 text-green-500" /> Verified Proof
                            </div>
                          </div>
                        )}
                     </div>
                   ))}

                   {showAddCert && (
                     <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-6">
                       <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                          <div className="flex items-center justify-between">
                            <h4 className="text-3xl font-black text-black tracking-tighter">New Qualification</h4>
                            <button onClick={() => setShowAddCert(false)} className="text-gray-400 hover:text-black transition-colors"><X className="w-8 h-8" /></button>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qualification Name</label>
                              <input type="text" placeholder="e.g. Master of Computer Science" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-black" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                                <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-black appearance-none cursor-pointer">
                                  <option>Bachelors</option>
                                  <option>Diploma</option>
                                  <option>Masters</option>
                                  <option>PhD</option>
                                  <option>Certification</option>
                                  <option>Certificate</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Graduation Year</label>
                                <input type="text" placeholder="2024" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-black" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Certificate Photo Proof</label>
                              <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 group hover:border-[#facc15] hover:bg-[#facc15]/5 transition-all cursor-pointer text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#facc15] transition-colors">
                                  <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-black" />
                                </div>
                                <div>
                                  <span className="text-[11px] font-black text-black uppercase tracking-widest block">Upload Document Proof</span>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-1 block">Maximum size 5MB (JPG, PNG)</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button onClick={() => setShowAddCert(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Cancel</button>
                            <button className="flex-1 py-5 bg-black text-[#facc15] text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 transition-all">Verify & Register</button>
                          </div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               <div className="space-y-8 pt-16 border-t-2 border-gray-50">
                 <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                   <div className="w-16 h-16 bg-[#facc15] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#facc15]/40">
                     <FileText className="w-8 h-8 text-black" />
                   </div>
                   <h2 className="text-3xl font-black text-black tracking-tight uppercase">CV Builder</h2>
                   <p className="text-gray-500 font-medium leading-relaxed">
                     Synthesize your qualifications, verified certificates, and career experience into a high-impact profile document ready for Craftlab organizations.
                   </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-10 bg-black rounded-[3rem] border border-white/10 flex flex-col justify-between space-y-8 shadow-2xl group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#facc15]/20 transition-all duration-700"></div>
                      <div className="flex items-start gap-6 relative z-10">
                        <Sparkles className="w-10 h-10 text-[#facc15] shrink-0" />
                        <div>
                          <h3 className="text-white font-black text-2xl tracking-tighter uppercase">Build CV</h3>
                          <p className="text-gray-500 text-xs font-medium leading-relaxed mt-2">Generate a recruiter-optimized profile layout in seconds.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleBuildCv}
                        disabled={isBuilding}
                        className="w-full py-5 bg-[#facc15] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 relative z-10"
                      >
                        {isBuilding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                        {isBuilding ? 'BUILDING...' : 'GENERATE CV'}
                      </button>
                   </div>

                   <div className="p-10 bg-gray-50 rounded-[3rem] border-2 border-gray-100 flex flex-col justify-between space-y-8">
                      <div className="flex items-start gap-6">
                        <FileText className="w-10 h-10 text-black shrink-0" />
                        <div>
                          <h3 className="text-black font-black text-2xl tracking-tighter uppercase">Download</h3>
                          <p className="text-gray-400 text-xs font-medium leading-relaxed mt-2">Export your generated CV as a secure PDF document.</p>
                        </div>
                      </div>
                      <button className="w-full py-5 bg-white border-2 border-gray-200 text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:border-black transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2">
                        Download PDF
                      </button>
                   </div>
                 </div>
               </div>
             </div>
          )}

          <div className="pt-12 border-t-2 border-gray-50 flex justify-end gap-6">
            <button
              onClick={() => onNavigate('DASHBOARD')}
              disabled={saving}
              className="px-10 py-5 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving || uploading !== null}
              className="px-12 py-5 bg-black text-[#facc15] text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 hover:bg-gray-900 shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
