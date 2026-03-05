import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, X, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';

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
}

interface AIGeneratedContent {
  summary: string;
  highlights: string[];
  keyStrengths: string[];
  education: string;
  skills: string;
  projects: Array<{ title: string; description: string }>;
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
      const opt = {
        margin: 10,
        filename: `${studentData.name.replace(/\s+/g, '_')}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      html2pdf().set(opt).from(element).save();
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
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">CV Builder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#facc15] animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-red-900">Error</h3>
                <p className="text-xs text-red-800 font-medium mt-1">{error}</p>
              </div>
            </div>
          ) : !isPreview ? (
            <div className="space-y-6">
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
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div ref={cvRef} className="bg-white">
              {studentData && <CVPreview studentData={studentData} aiContent={aiContent} />}
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

interface CVPreviewProps {
  studentData: StudentProfile;
  aiContent: AIGeneratedContent | null;
}

const CVPreview: React.FC<CVPreviewProps> = ({ studentData, aiContent }) => {
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
    ? studentData.skills_detailed.map((skill: any) =>
        typeof skill === 'string' ? skill : skill.skill || skill.name || ''
      ).filter(Boolean)
    : [];

  const education = Array.isArray(studentData.education)
    ? studentData.education
    : [];

  const employment = Array.isArray(studentData.employment_history)
    ? studentData.employment_history
    : [];

  const mediaLinks = studentData.media_links && typeof studentData.media_links === 'object'
    ? Object.entries(studentData.media_links).filter(([_, url]) => url)
    : [];

  return (
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000000', fontSize: '15px', lineHeight: '1.5' }} className="p-12 bg-white">
      {/* HEADER - NAME */}
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', textAlign: 'left', color: '#000000' }}>
          {studentData.name}
        </h1>
      </div>

      {/* CONTACT INFORMATION - BLOCK FORMAT */}
      <div style={{ marginBottom: '12px', fontSize: '15px' }}>
        <div style={{ display: 'block' }}>
          {studentData.email && (
            <div style={{ margin: '0' }}>{studentData.email}</div>
          )}
          {studentData.contact_email && studentData.contact_email !== studentData.email && (
            <div style={{ margin: '0' }}>{studentData.contact_email}</div>
          )}
          {studentData.contact_phone && (
            <div style={{ margin: '0' }}>{studentData.contact_phone}</div>
          )}
          {studentData.address && (
            <div style={{ margin: '0' }}>{studentData.address}</div>
          )}
        </div>
      </div>

      {/* MEDIA LINKS - BLOCK FORMAT */}
      {mediaLinks.length > 0 && (
        <div style={{ marginBottom: '12px', fontSize: '15px' }}>
          {mediaLinks.map(([platform, url]: [string, any]) => (
            <div key={platform} style={{ margin: '0' }}>
              {getMediaLinkText(platform)}: {url}
            </div>
          ))}
        </div>
      )}

      {/* PROFESSIONAL SUMMARY - BLOCK FORMAT WITH 150+ WORDS */}
      {(aiContent?.summary || studentData.professional_summary) && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '12px 0 6px 0', textAlign: 'left', color: '#000000' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ fontSize: '15px', lineHeight: '1.5', margin: '0', color: '#000000', textAlign: 'justify' }}>
            {aiContent?.summary || studentData.professional_summary}
          </p>
        </div>
      )}

      {/* KEY STRENGTHS - BLOCK FORMAT */}
      {aiContent?.keyStrengths && aiContent.keyStrengths.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '12px 0 6px 0', textAlign: 'left', color: '#000000' }}>
            KEY STRENGTHS
          </h2>
          <div style={{ display: 'block' }}>
            {aiContent.keyStrengths.map((strength: string, idx: number) => (
              <div key={idx} style={{ fontSize: '15px', margin: '0', color: '#000000' }}>
                • {strength}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS & EXPERTISE - BLOCK FORMAT */}
      {(aiContent?.skills || skills.length > 0) && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '12px 0 6px 0', textAlign: 'left', color: '#000000' }}>
            SKILLS & EXPERTISE
          </h2>
          <p style={{ fontSize: '15px', lineHeight: '1.5', margin: '0', color: '#000000', textAlign: 'justify' }}>
            {aiContent?.skills || skills.join(' • ')}
          </p>
        </div>
      )}

      {/* EDUCATION - BLOCK FORMAT */}
      {(aiContent?.education || education.length > 0) && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '12px 0 6px 0', textAlign: 'left', color: '#000000' }}>
            EDUCATION
          </h2>
          {aiContent?.education && (
            <p style={{ fontSize: '15px', lineHeight: '1.5', margin: '0', color: '#000000', textAlign: 'justify' }}>
              {aiContent.education}
            </p>
          )}
          {!aiContent?.education && education.length > 0 && (
            <div>
              {education.map((edu: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '15px' }}>
                  <div style={{ display: 'block', marginBottom: '0' }}>
                    <div style={{ margin: '0', fontWeight: 'bold', color: '#000000' }}>
                      {edu.degree || edu.qualification || 'Degree'}
                      {(edu.graduation_year || edu.end_year) && (
                        <span style={{ fontWeight: 'normal', marginLeft: '12px', color: '#000000' }}>
                          {edu.graduation_year || edu.end_year}
                        </span>
                      )}
                    </div>
                    <div style={{ margin: '0', color: '#000000' }}>
                      {edu.institution || edu.school || 'Institution'}
                    </div>
                    {edu.field_of_study && (
                      <div style={{ margin: '0', color: '#000000' }}>
                        {edu.field_of_study}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMPLOYMENT HISTORY - BLOCK FORMAT */}
      {employment.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '12px 0 6px 0', textAlign: 'left', color: '#000000' }}>
            EMPLOYMENT HISTORY
          </h2>
          <div>
            {employment.map((job: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '8px', fontSize: '15px' }}>
                <div style={{ display: 'block', marginBottom: '0' }}>
                  <div style={{ margin: '0', fontWeight: 'bold', color: '#000000' }}>
                    {job.job_title || job.position || 'Position'}
                    {(job.start_date || job.end_date) && (
                      <span style={{ fontWeight: 'normal', marginLeft: '12px', color: '#000000' }}>
                        {job.start_date && `${job.start_date}`}
                        {job.start_date && job.end_date ? ' - ' : ''}
                        {job.end_date && `${job.end_date}`}
                        {!job.start_date && !job.end_date && 'N/A'}
                      </span>
                    )}
                  </div>
                  <div style={{ margin: '0', color: '#000000' }}>
                    {job.company_name || job.company || 'Company'}
                  </div>
                  {job.description && (
                    <div style={{ margin: '0', color: '#000000', lineHeight: '1.5' }}>
                      {job.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECTS - BLOCK FORMAT */}
      {aiContent?.projects && aiContent.projects.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '12px 0 6px 0', textAlign: 'left', color: '#000000' }}>
            PROJECTS
          </h2>
          <div>
            {aiContent.projects.map((project: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '8px', fontSize: '15px' }}>
                <div style={{ margin: '0', fontWeight: 'bold', color: '#000000' }}>
                  {project.title}
                </div>
                <p style={{ margin: '0', color: '#000000', lineHeight: '1.5' }}>
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: '18px', paddingTop: '8px', fontSize: '12px', color: '#000000', textAlign: 'center' }}>
        <p style={{ margin: '0' }}>Generated from CraftLab Careers • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
};

export default CVBuilder;
