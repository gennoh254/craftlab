import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { ViewState } from '../App';
import {
  ArrowLeft,
  Save,
  Camera,
  Plus,
  X,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Trash2,
  Upload,
  FileText,
  Linkedin,
  Github,
  Globe
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, EducationEntry, EmploymentEntry, Certificate } from '../lib/supabase';

interface EditProfileProps {
  userRole: UserRole;
  onNavigate: (view: ViewState) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userRole, onNavigate }) => {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || '');
  const [contactEmail, setContactEmail] = useState(profile?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(profile?.contact_phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [professionalSummary, setProfessionalSummary] = useState(profile?.professional_summary || '');
  const [skills, setSkills] = useState<string>((profile?.skills as string[])?.join(', ') || '');

  const [mediaLinks, setMediaLinks] = useState({
    linkedin: profile?.media_links?.linkedin || '',
    github: profile?.media_links?.github || '',
    portfolio: profile?.media_links?.portfolio || '',
    twitter: profile?.media_links?.twitter || '',
  });

  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [employment, setEmployment] = useState<EmploymentEntry[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.education && typeof profile.education === 'string') {
      try {
        const parsed = JSON.parse(profile.education);
        if (Array.isArray(parsed)) {
          setEducation(parsed);
        }
      } catch (e) {
        setEducation([]);
      }
    } else if (Array.isArray(profile?.education)) {
      setEducation(profile.education as any);
    }

    if (profile?.employment_history && Array.isArray(profile.employment_history)) {
      setEmployment(profile.employment_history);
    }

    fetchCertificates();
  }, [profile]);

  const fetchCertificates = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCertificates(data);
    }
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

    if (file.size > 5 * 1024 * 1024) {
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

    if (file.size > 5 * 1024 * 1024) {
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

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString(),
        institution: '',
        course: '',
        degree: '',
        startDate: '',
        endDate: '',
        current: false,
      },
    ]);
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: any) => {
    setEducation(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const addEmployment = () => {
    setEmployment([
      ...employment,
      {
        id: Date.now().toString(),
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const updateEmployment = (id: string, field: keyof EmploymentEntry, value: any) => {
    setEmployment(
      employment.map((emp) =>
        emp.id === id ? { ...emp, [field]: value } : emp
      )
    );
  };

  const removeEmployment = (id: string) => {
    setEmployment(employment.filter((emp) => emp.id !== id));
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address: address,
          professional_summary: professionalSummary,
          skills: skillsArray,
          media_links: mediaLinks,
          education: education,
          employment_history: employment,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-black text-black tracking-tighter uppercase">Edit Profile</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-bold text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-100 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-bold text-green-600">Profile updated successfully!</p>
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
          <div className="space-y-8">
            <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
              <Mail className="w-5 h-5 text-[#facc15]" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="contact@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
              <LinkIcon className="w-5 h-5 text-[#facc15]" /> Media Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </label>
                <input
                  type="url"
                  value={mediaLinks.linkedin}
                  onChange={(e) => setMediaLinks({ ...mediaLinks, linkedin: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Github className="w-3 h-3" /> GitHub
                </label>
                <input
                  type="url"
                  value={mediaLinks.github}
                  onChange={(e) => setMediaLinks({ ...mediaLinks, github: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Portfolio
                </label>
                <input
                  type="url"
                  value={mediaLinks.portfolio}
                  onChange={(e) => setMediaLinks({ ...mediaLinks, portfolio: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Twitter/X
                </label>
                <input
                  type="url"
                  value={mediaLinks.twitter}
                  onChange={(e) => setMediaLinks({ ...mediaLinks, twitter: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
              <FileText className="w-5 h-5 text-[#facc15]" /> Professional Summary
            </h2>
            <textarea
              rows={5}
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all resize-none"
              placeholder="Write a brief professional summary about yourself, your goals, and what makes you unique..."
            />
          </div>

          <div className="space-y-8">
            <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
              <Award className="w-5 h-5 text-[#facc15]" /> Skills
            </h2>
            <div className="space-y-2">
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                placeholder="React, TypeScript, UI/UX Design, Figma (comma separated)"
              />
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                Separate skills with commas
              </p>
            </div>
          </div>

          {userRole === UserRole.STUDENT && (
            <>
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#facc15]" /> Education
                  </h2>
                  <button
                    onClick={addEducation}
                    className="px-4 py-2 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add Education
                  </button>
                </div>
                <div className="space-y-6">
                  {education.map((edu) => (
                    <div key={edu.id} className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-4 relative">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                            placeholder="University name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                            placeholder="Bachelor of Science"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Course/Field</label>
                          <input
                            type="text"
                            value={edu.course}
                            onChange={(e) => updateEducation(edu.id, 'course', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                            placeholder="Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            disabled={edu.current}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all disabled:opacity-50"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Currently Studying Here</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {education.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8 font-medium">No education entries yet. Click "Add Education" to get started.</p>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#facc15]" /> Employment History
                  </h2>
                  <button
                    onClick={addEmployment}
                    className="px-4 py-2 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add Employment
                  </button>
                </div>
                <div className="space-y-6">
                  {employment.map((emp) => (
                    <div key={emp.id} className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-4 relative">
                      <button
                        onClick={() => removeEmployment(emp.id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Company</label>
                          <input
                            type="text"
                            value={emp.company}
                            onChange={(e) => updateEmployment(emp.id, 'company', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                            placeholder="Company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Role</label>
                          <input
                            type="text"
                            value={emp.role}
                            onChange={(e) => updateEmployment(emp.id, 'role', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                            placeholder="Job title"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                          <input
                            type="month"
                            value={emp.startDate}
                            onChange={(e) => updateEmployment(emp.id, 'startDate', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
                          <input
                            type="month"
                            value={emp.endDate}
                            onChange={(e) => updateEmployment(emp.id, 'endDate', e.target.value)}
                            disabled={emp.current}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all disabled:opacity-50"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emp.current}
                              onChange={(e) => updateEmployment(emp.id, 'current', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Currently Working Here</span>
                          </label>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                          <textarea
                            rows={3}
                            value={emp.description}
                            onChange={(e) => updateEmployment(emp.id, 'description', e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all resize-none"
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {employment.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8 font-medium">No employment history yet. Click "Add Employment" to get started.</p>
                  )}
                </div>
              </div>

              <CertificatesSection
                userId={user?.id || ''}
                certificates={certificates}
                onRefresh={fetchCertificates}
              />
            </>
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

const CertificatesSection: React.FC<{
  userId: string;
  certificates: Certificate[];
  onRefresh: () => void;
}> = ({ userId, certificates, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'form' | 'upload'>('form');
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    category: 'Certificate' as Certificate['category'],
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setUploadStep('upload');
    }
  };

  const uploadCertificate = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
      return null;
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const url = await uploadCertificate(selectedFile);
      if (url) {
        setUploadedFileUrl(url);
        setUploadStep('form');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.issuer) {
      alert('Title and Issuer are required');
      return;
    }

    setUploading(true);

    try {
      const { error } = await supabase.from('certificates').insert({
        user_id: userId,
        title: formData.title,
        issuer: formData.issuer,
        issue_date: formData.issue_date || null,
        category: formData.category,
        description: formData.description,
        certificate_url: uploadedFileUrl || '',
      });

      if (error) throw error;

      setShowAddModal(false);
      setFormData({
        title: '',
        issuer: '',
        issue_date: '',
        category: 'Certificate',
        description: '',
      });
      setSelectedFile(null);
      setUploadedFileUrl(null);
      setUploadStep('form');
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, certificateUrl: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      if (certificateUrl) {
        const filePath = certificateUrl.split('/certificates/')[1];
        if (filePath) {
          await supabase.storage.from('certificates').remove([filePath]);
        }
      }

      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;

      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3">
          <Award className="w-5 h-5 text-[#facc15]" /> Certificates
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          <Plus className="w-3 h-3" /> Add Certificate
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-4 relative group">
            <button
              onClick={() => handleDelete(cert.id, cert.certificate_url)}
              className="absolute top-4 right-4 p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[9px] font-black bg-black text-[#facc15] px-3 py-1 rounded-full uppercase tracking-widest">
                {cert.category}
              </span>
            </div>
            <h4 className="text-base font-black text-black">{cert.title}</h4>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {cert.issuer} • {new Date(cert.issue_date).getFullYear()}
            </p>
            {cert.description && (
              <p className="text-xs text-gray-600 font-medium">{cert.description}</p>
            )}
            {cert.certificate_url && (
              <a
                href={cert.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[9px] font-black text-black hover:text-[#facc15] uppercase tracking-widest transition-colors"
              >
                <Upload className="w-3 h-3" /> View Certificate
              </a>
            )}
          </div>
        ))}
        {certificates.length === 0 && (
          <p className="md:col-span-2 text-sm text-gray-500 text-center py-8 font-medium">
            No certificates uploaded yet. Click "Add Certificate" to get started.
          </p>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-3xl font-black text-black tracking-tighter">Add Certificate</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black"
                    placeholder="e.g. AWS Certified Developer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black"
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Certificate['category'] })
                    }
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black appearance-none cursor-pointer"
                  >
                    <option>Certificate</option>
                    <option>Certification</option>
                    <option>Diploma</option>
                    <option>Bachelors</option>
                    <option>Masters</option>
                    <option>PhD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black resize-none"
                  placeholder="Brief description of the certificate..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Upload Certificate File
                </label>
                {uploadStep === 'upload' && !uploadedFileUrl ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Selected File:</p>
                      <p className="text-[11px] font-bold text-blue-800">{selectedFile?.name}</p>
                    </div>
                    <button
                      onClick={handleUploadFile}
                      disabled={uploading}
                      className="w-full py-4 bg-[#facc15] text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Upload File
                        </>
                      )}
                    </button>
                  </div>
                ) : uploadedFileUrl ? (
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                    <p className="text-[10px] font-black text-green-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" /> File Uploaded Successfully
                    </p>
                    <p className="text-[10px] font-medium text-green-800 truncate">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 group hover:border-[#facc15] hover:bg-[#facc15]/5 transition-all cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-300 group-hover:text-[#facc15]" />
                    <div className="text-center">
                      <span className="text-[11px] font-black text-black uppercase tracking-widest block">
                        Click to Upload
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-1 block">
                        PDF, JPG, PNG (Max 10MB)
                      </span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUploadStep('form');
                  setSelectedFile(null);
                  setUploadedFileUrl(null);
                }}
                disabled={uploading}
                className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {uploadedFileUrl ? (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 py-5 bg-black text-[#facc15] text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> OK
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !uploadedFileUrl}
                  className="flex-1 py-5 bg-gray-300 text-gray-500 text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl disabled:opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Add Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
