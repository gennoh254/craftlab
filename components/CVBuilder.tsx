import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, X, Loader as Loader2, CircleAlert as AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';

type LayoutType = 'modern' | 'classic' | 'minimal';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  professional_summary: string | null;
  bio: string | null;
  skills_detailed: any;
  education: any;
  employment_history: any;
  media_links: any;
  languages: any;
  certifications: any;
  projects: any;
  interests: any;
  referees: any;
}

interface AIGeneratedContent {
  summary: string;
  highlights: string[];
  keyStrengths: string[];
  education: string;
  skills: string;
  projects: Array<{ title: string; description: string }>;
  referees: Array<{
    name: string;
    position: string;
    company: string;
    contact: string;
  }>;
}

interface CVBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutType>('modern');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchStudentData();
    }
  }, [isOpen, user]);

  const generateAIContent = async (profile: StudentProfile) => {
    setAiLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate_cv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profile }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate CV content');
      }

      const data = await response.json();
      if (data.success) {
        setAiContent(data.data);
      }
    } catch (err) {
      console.error('Error generating AI content:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load profile data');
        return;
      }

      if (data) {
        setStudentData(data);
        await generateAIContent(data);
      } else {
        setError('No profile data found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while loading your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current || !studentData) return;

    setIsDownloading(true);
    try {
      const element = cvRef.current;
      const contentDiv = element.querySelector('div[style]');

      const opt = {
        margin: 0,
        filename: `${studentData.name.replace(/\s+/g, '_')}_CV.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        },
        jsPDF: {
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          hotfixes: ['px_scaling']
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf().set(opt).from(contentDiv || element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-7xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">CV Builder</h2>
          <div className="flex items-center gap-3">
            {isPreview && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayout('modern')}
                  className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${layout === 'modern' ? 'bg-black text-[#facc15]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Modern
                </button>
                <button
                  onClick={() => setLayout('classic')}
                  className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${layout === 'classic' ? 'bg-black text-[#facc15]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setLayout('minimal')}
                  className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${layout === 'minimal' ? 'bg-black text-[#facc15]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Minimal
                </button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <button
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isDarkTheme ? 'Light theme' : 'Dark theme'}
                >
                  {isDarkTheme ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex gap-6 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 flex-1">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 bg-red-50 rounded-xl p-6 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-red-900">Error</h3>
                <p className="text-xs text-red-800 font-medium mt-1">{error}</p>
              </div>
            </div>
          ) : !isPreview ? (
            <div className="flex-1 space-y-6">
              {aiLoading && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm font-bold text-blue-900">Generating modern CV with AI assistance...</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-black text-black mb-4 uppercase tracking-tight">CV Preview</h3>
                <button
                  onClick={() => setIsPreview(true)}
                  className="w-full py-3 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View CV Preview
                </button>
              </div>

              {studentData && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 space-y-3">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">CV Sections Included</h3>
                  <div className="text-xs text-blue-800 font-medium space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                      AI-Enhanced Professional Summary
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                      Key Strengths & Highlights
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                      Contact Information
                    </p>
                    {studentData.media_links && Object.keys(studentData.media_links).length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Media Links & Portfolio
                      </p>
                    )}
                    {studentData.skills_detailed && Array.isArray(studentData.skills_detailed) && studentData.skills_detailed.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Skills & Expertise ({studentData.skills_detailed.length} skills)
                      </p>
                    )}
                    {studentData.education && Array.isArray(studentData.education) && studentData.education.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Education ({studentData.education.length} entries)
                      </p>
                    )}
                    {studentData.employment_history && Array.isArray(studentData.employment_history) && studentData.employment_history.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Employment History ({studentData.employment_history.length} positions)
                      </p>
                    )}
                    {studentData.certifications && Array.isArray(studentData.certifications) && studentData.certifications.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Certifications & Awards ({studentData.certifications.length})
                      </p>
                    )}
                    {studentData.projects && Array.isArray(studentData.projects) && studentData.projects.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Projects ({studentData.projects.length})
                      </p>
                    )}
                    {studentData.languages && Array.isArray(studentData.languages) && studentData.languages.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Languages ({studentData.languages.length})
                      </p>
                    )}
                    {studentData.referees && Array.isArray(studentData.referees) && studentData.referees.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        References ({studentData.referees.length})
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div ref={cvRef} className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              {studentData && (
                <CVLayoutRenderer
                  studentData={studentData}
                  aiContent={aiContent}
                  layout={layout}
                  isDarkTheme={isDarkTheme}
                />
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3 sticky bottom-0 z-10">
          {isPreview && (
            <button
              onClick={() => setIsPreview(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || !isPreview || loading}
            className="flex-1 px-6 py-3 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download CV as PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CVLayoutRendererProps {
  studentData: StudentProfile;
  aiContent: AIGeneratedContent | null;
  layout: LayoutType;
  isDarkTheme: boolean;
}

const CVLayoutRenderer: React.FC<CVLayoutRendererProps> = ({
  studentData,
  aiContent,
  layout,
  isDarkTheme,
}) => {
  if (layout === 'modern') {
    return <ModernLayout studentData={studentData} aiContent={aiContent} isDarkTheme={isDarkTheme} />;
  } else if (layout === 'classic') {
    return <ClassicLayout studentData={studentData} aiContent={aiContent} isDarkTheme={isDarkTheme} />;
  } else {
    return <MinimalLayout studentData={studentData} aiContent={aiContent} isDarkTheme={isDarkTheme} />;
  }
};

interface CVLayoutProps {
  studentData: StudentProfile;
  aiContent: AIGeneratedContent | null;
  isDarkTheme: boolean;
}

const processCVData = (studentData: StudentProfile, aiContent: AIGeneratedContent | null) => {
  const getMediaLinkText = (platform: string): string => {
    const platformMap: { [key: string]: string } = {
      linkedin: 'LinkedIn',
      github: 'GitHub',
      portfolio: 'Portfolio',
      twitter: 'Twitter',
      website: 'Website',
      dribbble: 'Dribbble',
      behance: 'Behance'
    };
    return platformMap[platform] || platform;
  };

  const skills = Array.isArray(studentData.skills_detailed)
    ? studentData.skills_detailed.filter((skill: any) => skill && (skill.name || skill.skill))
    : [];

  const education = Array.isArray(studentData.education) ? studentData.education : [];
  const employment = Array.isArray(studentData.employment_history) ? studentData.employment_history : [];
  const mediaLinks = studentData.media_links && typeof studentData.media_links === 'object'
    ? Object.entries(studentData.media_links).filter(([_, url]) => url)
    : [];
  const referees = Array.isArray(studentData.referees) ? studentData.referees : [];

  return { getMediaLinkText, skills, education, employment, mediaLinks, referees };
};

const ModernLayout: React.FC<CVLayoutProps> = ({ studentData, aiContent, isDarkTheme }) => {
  const { skills, education, employment, mediaLinks, referees, getMediaLinkText } = processCVData(studentData, aiContent);
  const bgColor = isDarkTheme ? '#1a1a1a' : '#ffffff';
  const textColor = isDarkTheme ? '#ffffff' : '#000000';
  const sidebarBg = '#1e3a8a';
  const accentColor = '#2563eb';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: bgColor, color: textColor }}>
      {/* SIDEBAR */}
      <div style={{ width: '30%', backgroundColor: sidebarBg, color: 'white', padding: '40px 30px', overflow: 'auto' }}>
        {studentData.avatar_url && (
          <img src={studentData.avatar_url} alt={studentData.name} style={{ width: '140px', height: '140px', borderRadius: '50%', marginBottom: '30px', objectFit: 'cover', border: '4px solid white' }} />
        )}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'white', lineHeight: 1.2 }}>
          {studentData.name}
        </h1>

        <div style={{ marginBottom: '30px', fontSize: '13px', lineHeight: '1.6', color: '#e0e7ff' }}>
          {studentData.contact_email && <div>{studentData.contact_email}</div>}
          {studentData.contact_phone && <div>{studentData.contact_phone}</div>}
          {studentData.address && <div>{studentData.address}</div>}
        </div>

        {skills.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', color: '#60a5fa', borderBottom: '2px solid #60a5fa', paddingBottom: '10px' }}>
              Skills
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {skills.slice(0, 10).map((skill: any, idx: number) => (
                <div key={idx} style={{ fontSize: '13px' }}>
                  <div style={{ marginBottom: '5px', fontWeight: '600', color: 'white' }}>
                    {skill.name || skill.skill}
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(96, 165, 250, 0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: '#60a5fa', width: `${skill.proficiency === 'Expert' ? 100 : skill.proficiency === 'Advanced' ? 80 : skill.proficiency === 'Intermediate' ? 60 : 40}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '40px 40px', overflow: 'auto', backgroundColor: bgColor }}>
        {aiContent?.summary || studentData.professional_summary ? (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px' }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: isDarkTheme ? '#e0e0e0' : '#333333', margin: 0 }}>
              {aiContent?.summary || studentData.professional_summary}
            </p>
          </div>
        ) : null}

        {employment.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px' }}>
              Experience
            </h2>
            <div style={{ position: 'relative', paddingLeft: '30px' }}>
              {employment.map((job: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '30px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-20px', top: '5px', width: '14px', height: '14px', backgroundColor: accentColor, borderRadius: '50%', border: `3px solid ${bgColor}` }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 5px 0', color: textColor }}>
                    {job.role || job.position}
                  </h3>
                  <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: accentColor, fontWeight: '600' }}>
                    {job.company}
                  </p>
                  <p style={{ fontSize: '12px', margin: '0 0 10px 0', color: isDarkTheme ? '#888888' : '#666666' }}>
                    {job.startDate} – {job.current ? 'Present' : job.endDate}
                  </p>
                  {job.description && (
                    <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: isDarkTheme ? '#d0d0d0' : '#444444' }}>
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px' }}>
              Education
            </h2>
            <div style={{ position: 'relative', paddingLeft: '30px' }}>
              {education.map((edu: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '25px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-20px', top: '5px', width: '14px', height: '14px', backgroundColor: accentColor, borderRadius: '50%', border: `3px solid ${bgColor}` }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 5px 0', color: textColor }}>
                    {edu.degree}
                  </h3>
                  <p style={{ fontSize: '13px', margin: '0 0 5px 0', color: accentColor, fontWeight: '600' }}>
                    {edu.institution}
                  </p>
                  <p style={{ fontSize: '12px', margin: 0, color: isDarkTheme ? '#888888' : '#666666' }}>
                    {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {referees.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px' }}>
              References
            </h2>
            <div>
              {referees.map((ref: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '20px', fontSize: '13px' }}>
                  <div style={{ fontWeight: '600', color: textColor }}>{ref.name}</div>
                  <div style={{ color: isDarkTheme ? '#d0d0d0' : '#666666' }}>{ref.position} at {ref.company}</div>
                  {ref.email && <div style={{ color: isDarkTheme ? '#d0d0d0' : '#666666', fontSize: '12px' }}>{ref.email}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ClassicLayout: React.FC<CVLayoutProps> = ({ studentData, aiContent, isDarkTheme }) => {
  const { skills, education, employment, mediaLinks, referees, getMediaLinkText } = processCVData(studentData, aiContent);
  const bgColor = isDarkTheme ? '#2a2a2a' : '#ffffff';
  const textColor = isDarkTheme ? '#ffffff' : '#000000';
  const borderColor = isDarkTheme ? '#444444' : '#cccccc';

  return (
    <div style={{ maxWidth: '8.5in', margin: '0 auto', padding: '1in', fontFamily: 'Georgia, serif', fontSize: '11px', lineHeight: '1.5', backgroundColor: bgColor, color: textColor, minHeight: '11in' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', fontWeight: 'bold', letterSpacing: '2px', color: textColor }}>
          {studentData.name}
        </h1>
        <div style={{ fontSize: '10px', color: isDarkTheme ? '#d0d0d0' : '#333333' }}>
          {[studentData.contact_email, studentData.contact_phone, studentData.address].filter(Boolean).join(' • ')}
        </div>
      </div>

      {aiContent?.summary || studentData.professional_summary ? (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '15px 0 10px 0', letterSpacing: '1px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px', color: textColor }}>
            Professional Summary
          </h2>
          <p style={{ margin: '0', fontSize: '11px', lineHeight: '1.6', color: isDarkTheme ? '#d0d0d0' : '#333333' }}>
            {aiContent?.summary || studentData.professional_summary}
          </p>
        </div>
      ) : null}

      {employment.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '15px 0 10px 0', letterSpacing: '1px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px', color: textColor }}>
            Employment History
          </h2>
          {employment.map((job: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontWeight: 'bold', color: textColor }}>{job.role}</span>
                <span style={{ fontSize: '10px', color: isDarkTheme ? '#888888' : '#666666' }}>{job.startDate} – {job.current ? 'Present' : job.endDate}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#2563eb', marginBottom: '4px' }}>{job.company}</div>
              {job.description && <div style={{ fontSize: '10px', color: isDarkTheme ? '#c0c0c0' : '#444444' }}>{job.description}</div>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '15px 0 10px 0', letterSpacing: '1px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px', color: textColor }}>
            Education
          </h2>
          {education.map((edu: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: textColor }}>{edu.degree}</span>
                <span style={{ fontSize: '10px', color: isDarkTheme ? '#888888' : '#666666' }}>{edu.endDate}</span>
              </div>
              <div style={{ color: isDarkTheme ? '#c0c0c0' : '#333333' }}>{edu.institution}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '15px 0 10px 0', letterSpacing: '1px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px', color: textColor }}>
            Skills
          </h2>
          <div style={{ color: isDarkTheme ? '#d0d0d0' : '#333333' }}>
            {skills.map((skill: any) => skill.name || skill.skill).join(' • ')}
          </div>
        </div>
      )}

      {referees.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '15px 0 10px 0', letterSpacing: '1px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px', color: textColor }}>
            References
          </h2>
          {referees.map((ref: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '8px', fontSize: '10px', color: isDarkTheme ? '#c0c0c0' : '#333333' }}>
              <div style={{ fontWeight: 'bold', color: textColor }}>{ref.name}</div>
              <div>{ref.position} • {ref.company}</div>
              {ref.email && <div>{ref.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MinimalLayout: React.FC<CVLayoutProps> = ({ studentData, aiContent, isDarkTheme }) => {
  const { skills, education, employment, mediaLinks, referees, getMediaLinkText } = processCVData(studentData, aiContent);
  const bgColor = isDarkTheme ? '#1f1f1f' : '#ffffff';
  const textColor = isDarkTheme ? '#ffffff' : '#000000';
  const accentColor = isDarkTheme ? '#888888' : '#999999';

  return (
    <div style={{ maxWidth: '8.5in', margin: '0 auto', padding: '60px 50px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '13px', lineHeight: '1.8', backgroundColor: bgColor, color: textColor, minHeight: '11in', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
      {/* LEFT COLUMN */}
      <div>
        <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '300', letterSpacing: '0.5px', color: textColor }}>
          {studentData.name}
        </h1>
        <p style={{ fontSize: '13px', margin: '0 0 40px 0', color: accentColor, fontWeight: '300' }}>
          {studentData.contact_email || studentData.email}
        </p>

        {skills.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 20px 0', letterSpacing: '1px', color: textColor }}>
              Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {skills.slice(0, 8).map((skill: any, idx: number) => (
                <div key={idx} style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: isDarkTheme ? '#2a2a2a' : '#f5f5f5', borderRadius: '20px', fontSize: '12px', color: textColor }}>
                  {skill.name || skill.skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {employment.length > 0 && (
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 25px 0', letterSpacing: '1px', color: textColor }}>
              Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {employment.slice(0, 3).map((job: any, idx: number) => (
                <div key={idx} style={{ borderLeft: '2px solid ' + accentColor, paddingLeft: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0', color: textColor }}>
                    {job.role}
                  </h4>
                  <p style={{ fontSize: '12px', margin: '5px 0 8px 0', color: accentColor, fontWeight: '500' }}>
                    {job.company}
                  </p>
                  <p style={{ fontSize: '11px', margin: '0', color: accentColor }}>
                    {job.startDate} – {job.current ? 'Present' : job.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div>
        {aiContent?.summary || studentData.professional_summary ? (
          <div style={{ marginBottom: '50px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 15px 0', letterSpacing: '1px', color: textColor }}>
              About
            </h3>
            <p style={{ fontSize: '13px', margin: '0', lineHeight: '1.8', color: isDarkTheme ? '#d0d0d0' : '#444444' }}>
              {aiContent?.summary || studentData.professional_summary}
            </p>
          </div>
        ) : null}

        {education.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 20px 0', letterSpacing: '1px', color: textColor }}>
              Education
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {education.map((edu: any, idx: number) => (
                <div key={idx}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0', color: textColor }}>
                    {edu.degree}
                  </h4>
                  <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: accentColor }}>
                    {edu.institution} • {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {referees.length > 0 && (
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 15px 0', letterSpacing: '1px', color: textColor }}>
              References
            </h3>
            <div style={{ fontSize: '12px', color: isDarkTheme ? '#c0c0c0' : '#444444' }}>
              {referees.slice(0, 2).map((ref: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  {ref.name} • {ref.position}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVBuilder;
