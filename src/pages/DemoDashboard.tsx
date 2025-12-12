import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, Award, TrendingUp, Play, BookOpen, MapPin, DollarSign, Calendar, ArrowRight } from 'lucide-react';

const DemoDashboard: React.FC = () => {
  const demoUser = {
    name: 'Demo User',
    email: 'demo@craftlab.com',
    userType: 'attachee',
    completionScore: 75,
    profilePicture: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?w=200&h=200'
  };

  const demoStats = [
    { label: 'Profile Completion', value: '75%', icon: <User className="h-6 w-6 text-yellow-400" /> },
    { label: 'Matched Opportunities', value: '12', icon: <Briefcase className="h-6 w-6 text-blue-400" /> },
    { label: 'Certificates', value: '3', icon: <Award className="h-6 w-6 text-green-400" /> },
    { label: 'Portfolio Videos', value: '5', icon: <Play className="h-6 w-6 text-purple-400" /> },
  ];

  const demoOpportunities = [
    {
      id: '1',
      title: 'Software Development Internship',
      company: 'TechCorp Kenya',
      location: 'Nairobi',
      type: 'Internship',
      salary: 'KSh 30,000/month',
      match: 92,
      deadline: '2025-01-15'
    },
    {
      id: '2',
      title: 'Web Development Attachment',
      company: 'Digital Solutions Ltd',
      location: 'Mombasa',
      type: 'Attachment',
      salary: 'KSh 25,000/month',
      match: 87,
      deadline: '2025-01-20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative page-transition"
         style={{
           backgroundImage: `url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Demo Notice */}
        <div className="glass bg-yellow-500/20 backdrop-blur-lg p-4 rounded-xl border border-yellow-500/30 mb-6 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-medium">Demo Dashboard Preview</p>
                <p className="text-yellow-200 text-sm">This is a preview of the CraftLab dashboard. Register to access full features.</p>
              </div>
            </div>
            <Link
              to="/register"
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift font-medium whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-black" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{demoUser.name}</h2>
              <p className="text-gray-300">{demoUser.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 text-sm rounded-full capitalize">
                {demoUser.userType}
              </span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">{demoUser.completionScore}%</div>
              <p className="text-gray-300 text-sm">Profile Complete</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {demoStats.map((stat, index) => (
            <div
              key={index}
              className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all hover-lift animate-fadeInUp"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Matched Opportunities */}
        <div className="glass bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white flex items-center">
              <Briefcase className="h-6 w-6 mr-2 text-yellow-400" />
              AI-Matched Opportunities
            </h3>
            <Link
              to="/opportunities"
              className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {demoOpportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="glass bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all hover-lift"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-xl font-semibold text-white">{opportunity.title}</h4>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                        {opportunity.match}% Match
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{opportunity.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {opportunity.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {opportunity.salary}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4">
                  <button className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift font-medium">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-yellow-400/30 text-center animate-fadeInUp">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Create your free account to unlock AI-powered matching, build your portfolio, and connect with top opportunities.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-all hover-lift font-semibold"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 glass bg-white/10 backdrop-blur-lg text-white rounded-lg hover:bg-white/20 transition-all hover-lift font-semibold border border-white/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
