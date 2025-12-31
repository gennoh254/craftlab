import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept, onReject }) => {
  const [hasRead, setHasRead] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    if (hasRead && scrolledToBottom) {
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
            <p className="text-gray-400 text-sm mt-1">Please read and accept to continue</p>
          </div>
          <button
            onClick={onReject}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 text-gray-300 text-sm space-y-4"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-white text-lg mb-2">TERMS & CONDITIONS</h3>
              <p className="text-gray-400">Craftlabhub (Craftlab)</p>
              <p className="text-gray-500 text-xs">Last Updated: November 14, 2025</p>
            </div>

            <p>
              Welcome to Craftlabhub, an online platform operated by Craftlab ("we," "us," "our"). These Terms & Conditions ("Terms") govern your access to and use of Craftlabhub and all associated services. By using the platform, you agree to these Terms. If you do not agree, please do not use Craftlabhub.
            </p>

            <div>
              <h4 className="font-bold text-white mb-2">1. DEFINITIONS</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Craftlab: The business operating the Craftlabhub platform.</li>
                <li>Craftlabhub / "the Platform": The website, systems, and services available at craftlabhub.</li>
                <li>User: Anyone using the Platform, including students, educators, and organizations.</li>
                <li>Student: A user seeking attachment, internship, mentorship, or career opportunities.</li>
                <li>Organization / Employer: A verified startup, company, or institution using the platform to find talent.</li>
                <li>Verified Employer: An organization we have screened and approved to access student data.</li>
                <li>AI Matching System: The automated system that matches skills, experience, and preferences between Students and Organizations.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">2. ELIGIBILITY</h4>
              <p>Users must:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                <li>Be at least 18 years old or have verifiable parental/guardian consent.</li>
                <li>Provide accurate, truthful information.</li>
                <li>Agree to these Terms and applicable laws, including Kenya's Data Protection Act (DPA) 2019.</li>
              </ol>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">3. USER ACCOUNTS</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Users must register an account to use core services.</li>
                <li>You are responsible for protecting your password and login details.</li>
                <li>Craftlab is not liable for unauthorized account access caused by user negligence.</li>
                <li>We may suspend or terminate accounts that violate these Terms or engage in suspicious activity.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">4. PLATFORM PURPOSE</h4>
              <p className="font-semibold text-white mb-1">Craftlabhub provides:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 mb-3">
                <li>A platform where students can find internships, attachments, volunteer work, and job opportunities.</li>
                <li>A database where qualified and verified employers can access relevant student profiles.</li>
                <li>An AI-powered matching system that provides recommended matches.</li>
              </ul>
              <p className="font-semibold text-white mb-1">Craftlab does NOT guarantee:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>That a student will be placed in any opportunity.</li>
                <li>The accuracy or legitimacy of employer information.</li>
                <li>The behavior, professionalism, or safety of any organization or student.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">5. USE OF AI MATCHING SYSTEM</h4>
              <p>By using Craftlabhub, you agree that:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                <li>Your profile data may be processed using algorithms and AI to match you with opportunities.</li>
                <li>AI-generated matches are recommendations only; Craftlab is not responsible for decisions made by students or organizations.</li>
                <li>The AI may not always be accurate, complete, or error-free.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">6. DATA COLLECTION & ACCESS BY EMPLOYERS</h4>
              <p className="font-semibold text-white mb-1">Craftlab collects personal information such as:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 mb-3">
                <li>Name, email, phone number</li>
                <li>Education and skills</li>
                <li>CV/resume details</li>
                <li>Work experience and interests</li>
                <li>Uploaded documents</li>
                <li>Application history</li>
              </ul>
              <p className="font-semibold text-white mb-1">Who can access your data?</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 mb-3">
                <li>Only verified employers can view student data relevant to matching and recruitment.</li>
                <li>Craftlab may manually review profiles for quality and verification.</li>
                <li>Employers must comply with data protection laws and the Terms of this platform.</li>
              </ul>
              <p className="font-semibold text-white mb-1">Data sharing limitations</p>
              <p className="text-gray-300">We do NOT sell personal data. We only share it to verified employers, services necessary to provide the platform, and AI systems for matching. Your use of the platform constitutes consent for the above.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">7. USER RESPONSIBILITIES</h4>
              <p>Users agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                <li>Provide truthful and updated information.</li>
                <li>Not impersonate another person or submit false documents.</li>
                <li>Respect other users and employers.</li>
                <li>Comply with all applicable laws and workplace policies.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">8. EMPLOYER RESPONSIBILITIES</h4>
              <p>Verified employers agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2 mb-3">
                <li>Provide accurate organization and opportunity details.</li>
                <li>Use student data ONLY for legitimate recruitment purposes.</li>
                <li>Not exploit, discriminate against, or endanger students.</li>
                <li>Observe all Kenya labour and internship laws.</li>
                <li>Not share student information with third parties without consent.</li>
              </ul>
              <p className="text-gray-300">Craftlab is not responsible for employer actions, decisions, or conduct.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">9. DATA SECURITY & LIMITATION OF LIABILITY</h4>
              <p>Craftlab implements reasonable technical and organizational security measures, including:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 mb-3">
                <li>Encrypted data storage</li>
                <li>Secure servers</li>
                <li>Restricted access controls</li>
                <li>Regular security assessments</li>
              </ul>
              <p className="text-gray-300 mb-2">However, users acknowledge that no online system is 100% secure. Craftlab is not liable for breaches caused by third-party services, employer misuse, hacking, or user negligence.</p>
              <p className="font-semibold text-white mb-1">In case of a breach:</p>
              <p className="text-gray-300">Craftlab will take necessary containment measures, notify affected users as required by law, and cooperate with regulators.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">10. THIRD-PARTY SERVICES</h4>
              <p>Craftlabhub may contain links to third-party websites or services. We are not responsible for their content, data protection practices, job listings, or the safety of external opportunities.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">11. INTELLECTUAL PROPERTY</h4>
              <p>All platform content, including text, images, logos, features, software, and design, belongs to Craftlab. Users may not copy, distribute, alter, or reproduce materials without written permission.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">12. TERMINATION OF SERVICE</h4>
              <p>Craftlab may suspend or remove user accounts for violating these Terms, fraudulent activity, misuse of data, manipulation of the AI system, or harmful behavior.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">13. INDEMNITY</h4>
              <p>Users and employers agree to indemnify and hold harmless Craftlab from any claims, damages, losses, or liabilities arising from misuse, employment disputes, false information, or violations of these Terms.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">14. DISCLAIMER OF WARRANTIES</h4>
              <p>The platform is provided "as is" and "as available". Craftlab does not guarantee system availability, AI accuracy, data security, or job posting validity. Users assume all risks.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">15. GOVERNING LAW</h4>
              <p>These Terms are governed by the laws of the Republic of Kenya. Disputes shall be resolved through negotiation, mediation, or arbitration.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">16. CHANGES TO TERMS</h4>
              <p>We may revise these Terms at any time. Continued use means you accept the updated Terms.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">17. CONTACT INFORMATION</h4>
              <p>For questions about these Terms & Conditions, contact:</p>
              <p className="mt-2 text-gray-300">
                <strong>Craftlab</strong><br/>
                Email: craftlabhub@gmail.com<br/>
                Phone: +254717532966<br/>
                Address: Africa Nazarene University
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 space-y-4">
          {!scrolledToBottom && (
            <p className="text-yellow-400 text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              Please scroll down to read the full Terms & Conditions
            </p>
          )}

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              disabled={!scrolledToBottom}
              className="w-5 h-5 rounded border border-white/20 bg-white/5 cursor-pointer accent-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className={`text-sm ${hasRead ? 'text-white font-semibold' : 'text-gray-400'}`}>
              I have read and agree to the Terms & Conditions
            </span>
          </label>

          <div className="flex gap-4">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasRead || !scrolledToBottom}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Accept & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
