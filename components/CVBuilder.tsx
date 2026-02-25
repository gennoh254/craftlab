import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, X, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface StudentProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  professional_summary: string | null;
  skills_detailed: string | null;
}

interface CVBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({ isOpen, onClose }) => {
  const { profile, user } = useAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchStudentData();
      fetchCertifications();
    }
  }, [isOpen, user]);

  const fetchStudentData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setStudentData(data);
    }
  };

  const fetchCertifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false });

    if (data) {
      setCertifications(data);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;

    setIsDownloading(true);
    try {
      const element = cvRef.current;
      const opt = {
        margin: 10,
        filename: `${studentData?.name || 'CV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        html2pdf().set(opt).from(element).save();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const skills = studentData?.skills_detailed
    ? JSON.parse(studentData.skills_detailed).map((skill: any) => skill.skill || skill)
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">CV Builder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isPreview ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-black text-black mb-4 uppercase tracking-tight">Preview</h3>
                <button
                  onClick={() => setIsPreview(true)}
                  className="w-full py-3 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View CV Preview
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 space-y-3">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">CV Information</h3>
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Your CV is automatically generated from your profile information including your name, professional summary, skills, education, and certifications. Download your CV to use when applying for opportunities.
                </p>
              </div>
            </div>
          ) : (
            <div ref={cvRef} className="bg-white">
              <CVPreview studentData={studentData} certifications={certifications} skills={skills} />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3 sticky bottom-0">
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
            disabled={isDownloading || !isPreview}
            className="flex-1 px-6 py-3 bg-black text-[#facc15] font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download CV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CVPreviewProps {
  studentData: StudentProfile | null;
  certifications: any[];
  skills: string[];
}

const CVPreview: React.FC<CVPreviewProps> = ({ studentData, certifications, skills }) => {
  if (!studentData) return null;

  return (
    <div className="max-w-2xl mx-auto p-12 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="mb-8 border-b-2 border-black pb-6">
        <h1 className="text-4xl font-black text-black mb-2">{studentData.name}</h1>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Student • Professional</p>
      </div>

      {studentData.professional_summary && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-black mb-3 uppercase tracking-tight border-b border-black pb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{studentData.professional_summary}</p>
        </div>
      )}

      {skills && skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-black mb-3 uppercase tracking-tight border-b border-black pb-2">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-lg border border-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {certifications && certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-black mb-3 uppercase tracking-tight border-b border-black pb-2">
            Education & Certifications
          </h2>
          <div className="space-y-4">
            {certifications.map((cert: any) => (
              <div key={cert.id} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900">{cert.title}</h3>
                  <p className="text-sm text-gray-600 font-semibold">{cert.issuer}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{cert.category} • {cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500 font-semibold">
        <p>Generated from CraftLab Careers • {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default CVBuilder;
