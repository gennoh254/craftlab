import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, X, Loader2, AlertCircle } from 'lucide-react';
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
  skills_detailed: any;
  education: any;
  employment_history: any;
  media_links: any;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchStudentData();
    }
  }, [isOpen, user]);

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
                      Contact Information
                    </p>
                    {studentData.media_links && Object.keys(studentData.media_links).length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Media Links
                      </p>
                    )}
                    {studentData.professional_summary && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                        Professional Summary
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
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div ref={cvRef} className="bg-white">
              {studentData && <CVPreview studentData={studentData} />}
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
}

const CVPreview: React.FC<CVPreviewProps> = ({ studentData }) => {
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
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#1f2937' }} className="p-16 bg-white">
      {/* HEADER */}
      <div style={{ borderBottom: '3px solid #000', marginBottom: '24px', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          {studentData.name}
        </h1>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Student Professional
        </p>
      </div>

      {/* CONTACT INFORMATION */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11px', fontWeight: '600' }}>
          {studentData.email && (
            <span>{studentData.email}</span>
          )}
          {studentData.contact_email && studentData.contact_email !== studentData.email && (
            <span>{studentData.contact_email}</span>
          )}
          {studentData.contact_phone && (
            <span>{studentData.contact_phone}</span>
          )}
          {studentData.address && (
            <span>{studentData.address}</span>
          )}
        </div>
      </div>

      {/* MEDIA LINKS */}
      {mediaLinks.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px' }}>
            {mediaLinks.map(([platform, url]: [string, any]) => (
              <span key={platform} style={{ fontWeight: '600' }}>
                {getMediaLinkText(platform)}: <span style={{ color: '#1f2937', textDecoration: 'underline' }}>{url}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PROFESSIONAL SUMMARY */}
      {studentData.professional_summary && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '11px', lineHeight: '1.6', margin: '0', color: '#374151' }}>
            {studentData.professional_summary}
          </p>
        </div>
      )}

      {/* SKILLS & EXPERTISE */}
      {skills.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
            Skills & Expertise
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill: string, idx: number) => (
              <span key={idx} style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#f3f4f6', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
            Education
          </h2>
          <div>
            {education.map((edu: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: '900', margin: '0' }}>
                    {edu.degree || edu.qualification || 'Degree'}
                  </h3>
                  {(edu.graduation_year || edu.end_year) && (
                    <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>
                      {edu.graduation_year || edu.end_year}
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontWeight: '700' }}>
                  {edu.institution || edu.school || 'Institution'}
                </p>
                {edu.field_of_study && (
                  <p style={{ margin: '0', fontSize: '10px', color: '#6b7280' }}>
                    {edu.field_of_study}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPLOYMENT HISTORY */}
      {employment.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
            Employment History
          </h2>
          <div>
            {employment.map((job: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: '900', margin: '0' }}>
                    {job.job_title || job.position || 'Position'}
                  </h3>
                  {(job.start_date || job.end_date) && (
                    <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>
                      {job.start_date && `${job.start_date}`}
                      {job.start_date && job.end_date ? ' - ' : ''}
                      {job.end_date && `${job.end_date}`}
                      {!job.start_date && !job.end_date && 'N/A'}
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontWeight: '700' }}>
                  {job.company_name || job.company || 'Company'}
                </p>
                {job.description && (
                  <p style={{ margin: '0', fontSize: '10px', color: '#6b7280', lineHeight: '1.5' }}>
                    {job.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #d1d5db', fontSize: '9px', color: '#9ca3af', textAlign: 'center' }}>
        <p style={{ margin: '0' }}>Generated from CraftLab Careers • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
};

export default CVBuilder;
