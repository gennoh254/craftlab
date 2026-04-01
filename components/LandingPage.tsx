import React from 'react';
import { ChevronRight, Users, Briefcase, Award, Zap, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="pt-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#facc15] rounded-lg flex items-center justify-center font-black text-black text-xl">
                CL
              </div>
              <span className="text-xl font-black tracking-tight">CRAFTLAB</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-0">
          <div className="max-w-3xl w-full space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                Connect. Grow.
                <span className="block text-[#facc15]">Succeed Together</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Craftlab Careers is where students and organizations connect to build meaningful opportunities. Share your potential, discover talent, and grow your network.
              </p>
            </div>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-[#facc15] text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-yellow-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </button>

            <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Network"
                description="Build connections with students and organizations"
              />
              <FeatureCard
                icon={<Briefcase className="w-6 h-6" />}
                title="Opportunities"
                description="Discover internships and career opportunities"
              />
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Grow"
                description="Develop skills and advance your career"
              />
            </div>
          </div>
        </main>

        <footer className="py-8 px-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
            <p>© 2024 Craftlab Careers. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 bg-white/5 rounded-xl border border-gray-700 hover:border-[#facc15] transition-all backdrop-blur-sm">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#facc15]/10 rounded-lg text-[#facc15] mb-4">
      {icon}
    </div>
    <h3 className="font-black text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
