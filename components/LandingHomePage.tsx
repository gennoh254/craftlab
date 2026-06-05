import React, { useState, useEffect } from 'react';
import { Zap, Users, Briefcase, Star, TrendingUp, Shield, CircleCheck as CheckCircle, House as HomeIcon } from 'lucide-react';
import { ViewState } from '../App';
import { supabase } from '../lib/supabase';

interface LandingHomePageProps {
  onNavigate: (view: ViewState) => void;
  onShowAuth?: (mode: 'login' | 'register') => void;
}

const LandingHomePage: React.FC<LandingHomePageProps> = ({ onNavigate, onShowAuth }) => {
  const [stats, setStats] = useState({ opportunities: 0, users: 0, organizations: 0, matches: 0 });
  const [visibleSection, setVisibleSection] = useState(0);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      setVisibleSection(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [oppsRes, usersRes, orgsRes, matchesRes] = await Promise.all([
        supabase.from('opportunities').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'STUDENT'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'ORGANIZATION'),
        supabase.from('student_matches').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        opportunities: oppsRes.count || 0,
        users: usersRes.count || 0,
        organizations: orgsRes.count || 0,
        matches: matchesRes.count || 0,
      });
    } catch (e) {
      // silent fail
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      desc: 'Our intelligent engine analyzes your skills and experience to surface the most relevant opportunities instantly.',
    },
    {
      icon: Shield,
      title: 'Verified Organizations',
      desc: 'Every organization on Craftlab is verified. Students connect only with trusted, credible employers.',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth Insights',
      desc: 'Track your profile strength, improve your CV with our builder, and monitor your application pipeline.',
    },
    {
      icon: Users,
      title: 'Professional Network',
      desc: 'Build meaningful connections with peers, mentors, and industry leaders across every sector.',
    },
  ];

  const testimonials = [
    {
      name: 'Amara Osei',
      role: 'UX Design Intern',
      org: 'TechCorp Ghana',
      text: 'Craftlab matched me with my dream internship in under a week. The AI recommendations were spot on.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    {
      name: 'David Kimani',
      role: 'Software Apprentice',
      org: 'InnovateSA',
      text: 'I applied to 3 opportunities and got shortlisted for 2. The platform made the whole process seamless.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    {
      name: 'Fatima Diallo',
      role: 'Marketing Volunteer',
      org: 'GreenAfrica NGO',
      text: 'As an organization, finding qualified students has never been easier. The talent pipeline is incredible.',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  ];

  const opportunityTypes = ['Internships', 'Attachments', 'Apprenticeships', 'Volunteer Roles'];

  return (
    <div className="relative overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Animated accent lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent opacity-60" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#facc15]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#facc15]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#facc15] rounded-xl flex items-center justify-center shadow-lg shadow-[#facc15]/20">
                <HomeIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.3em]">Craftlab Careers</p>
                <p className="text-xs text-gray-400 font-medium">Where Opportunities Begin</p>
              </div>
            </div>
          </div>
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#facc15]/10 border border-[#facc15]/30 px-4 py-2 rounded-full mb-8">
              <Zap className="w-3.5 h-3.5 text-[#facc15]" />
              <span className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.2em]">AI-Powered Career Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Where Talent
              <br />
              <span className="text-[#facc15]">Meets Opportunity</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed mb-10 max-w-xl">
              Craftlab Careers connects ambitious students with forward-thinking organizations through intelligent matching, verified listings, and a professional community built for Africa's next generation.
            </p>

            {/* Opportunity type pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {opportunityTypes.map(type => (
                <span key={type} className="text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Opportunities', value: stats.opportunities > 0 ? stats.opportunities.toLocaleString() : '50+' },
                { label: 'Students', value: stats.users > 0 ? stats.users.toLocaleString() : '1,200+' },
                { label: 'Organizations', value: stats.organizations > 0 ? stats.organizations.toLocaleString() : '80+' },
                { label: 'AI Matches Made', value: stats.matches > 0 ? stats.matches.toLocaleString() : '3,400+' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-[#facc15]">{stat.value}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.3em] mb-3">Why Craftlab</p>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
              Built for the Future<br />of Work in Africa
            </h2>
            <p className="text-gray-500 font-medium mt-4 max-w-xl mx-auto">
              A platform that understands the unique challenges and opportunities facing African students and organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#facc15] hover:shadow-xl transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#facc15] transition-colors">
                  <feature.icon className="w-5 h-5 text-[#facc15] group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-lg font-black text-black mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-950 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.3em] mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#facc15]/30 via-[#facc15] to-[#facc15]/30" />

            {[
              { step: '01', title: 'Build Your Profile', desc: 'Add your skills, education, and experience. Our AI evaluates your profile strength in real-time.', color: 'from-[#facc15] to-yellow-400' },
              { step: '02', title: 'Run AI Analysis', desc: 'One click triggers our matching engine to find the best opportunities aligned with your profile.', color: 'from-[#facc15] to-yellow-400' },
              { step: '03', title: 'Apply & Connect', desc: 'Apply directly to matched opportunities, message organizations, and track your application status.', color: 'from-[#facc15] to-yellow-400' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[#facc15]/10 to-[#facc15]/5 border border-[#facc15]/20 flex items-center justify-center mb-6 group-hover:border-[#facc15]/60 transition-colors">
                  <span className="text-3xl font-black text-[#facc15]">{item.step}</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.3em] mb-3">Community Stories</p>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight">Voices from the Network</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#facc15]/30 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                  <div>
                    <p className="text-sm font-black text-black">{t.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.role} · {t.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL CTA SECTION */}
      <section className="bg-black py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#facc15]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#facc15]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Ready to Launch Your Career?</h2>
          <p className="text-gray-300 font-medium max-w-2xl mx-auto">Join thousands of African students and organizations already using Craftlab to connect and grow.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#facc15] rounded-lg flex items-center justify-center">
              <span className="font-black text-black text-xs">CC</span>
            </div>
            <span className="font-black text-white text-sm">Craftlab Careers</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            &copy; 2024 Craftlab Technologies. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">About</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingHomePage;
