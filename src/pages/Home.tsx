import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, Award, Zap, Target, Shield, Play, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      title: "AI-Powered Matching",
      description: "Our intelligent system connects you with the perfect opportunities based on your skills and aspirations."
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-400" />,
      title: "Professional Portfolio",
      description: "Create stunning portfolios and CVs that showcase your achievements and attract top employers."
    },
    {
      icon: <Shield className="h-8 w-8 text-yellow-400" />,
      title: "Verified Credentials",
      description: "Build trust with verified certificates and endorsements from recognized institutions."
    },
    {
      icon: <Target className="h-8 w-8 text-yellow-400" />,
      title: "Smart Career Guidance",
      description: "Get personalized insights and recommendations to accelerate your career growth."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "500+", label: "Partner Organizations" },
    { number: "5,000+", label: "Successful Placements" },
    { number: "50+", label: "University Partners" }
  ];

  return (
    <div className="space-y-0 page-transition">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 bg-overlay overflow-hidden"
               style={{
                 backgroundImage: `url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fadeInUp">
              Launch Your Career with{' '}
              <span className="gradient-text animate-pulse-slow">AI-Powered</span> Precision
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              CraftLab revolutionizes career development by connecting talented individuals with meaningful opportunities through intelligent matching, automated portfolios, and verified credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <Link
                to="/register"
                className="bg-yellow-400 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2 hover-lift"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="glass border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 hover:text-black transition-all hover-lift flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 animate-fadeInUp">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2 animate-fadeInUp hover-lift" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-4xl font-bold gradient-text">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CraftLab?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've reimagined career development to be smarter, faster, and more effective than traditional methods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex justify-center mb-4 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-20 relative bg-overlay"
               style={{
                 backgroundImage: `url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-white mb-4">
              How CraftLab Works
            </h2>
            <p className="text-xl text-gray-300">
              Three simple steps to accelerate your career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover-lift animate-float">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Create Your Profile</h3>
              <p className="text-gray-300">
                Complete your profile with education, skills, and experience. Upload and verify your certificates.
              </p>
            </div>

            <div className="text-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover-lift animate-float" style={{animationDelay: '1s'}}>
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Get Matched</h3>
              <p className="text-gray-300">
                Our AI analyzes opportunities and matches you with positions that fit your profile perfectly.
              </p>
            </div>

            <div className="text-center animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover-lift animate-float" style={{animationDelay: '2s'}}>
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Launch Your Career</h3>
              <p className="text-gray-300">
                Organizations discover you through our platform. No more endless applications – opportunities find you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20 relative bg-overlay animate-gradient"
               style={{
                 background: 'linear-gradient(-45deg, #000000, #1f2937, #111827, #000000)',
                 backgroundSize: '400% 400%'
               }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students and professionals who are already building their future with CraftLab.
            </p>
            <Link
              to="/register"
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 hover:shadow-2xl inline-flex items-center space-x-2 hover-lift animate-pulse-slow"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;