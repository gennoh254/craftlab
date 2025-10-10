import React from 'react';
import { Target, Users, Lightbulb, Award, Zap, Shield } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: <Target className="h-8 w-8 text-yellow-400" />,
      title: "Purpose-Driven",
      description: "We believe every young person deserves meaningful career opportunities that align with their potential."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-400" />,
      title: "Innovation First",
      description: "We leverage cutting-edge AI technology to solve traditional career development challenges."
    },
    {
      icon: <Users className="h-8 w-8 text-yellow-400" />,
      title: "Community Focused",
      description: "Building stronger connections between organizations, educational institutions, and young talent."
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "AI-Powered Matching",
      description: "Intelligent algorithms that connect talent with opportunities based on skills, interests, and potential."
    },
    {
      icon: <Award className="h-6 w-6 text-yellow-400" />,
      title: "Professional Portfolio Builder",
      description: "Automated CV generation and portfolio creation tools that showcase your achievements effectively."
    },
    {
      icon: <Shield className="h-6 w-6 text-yellow-400" />,
      title: "Credential Verification",
      description: "Secure verification system partnering with universities to authenticate certificates and achievements."
    }
  ];

  return (
    <div className="space-y-0 page-transition">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 relative bg-overlay"
               style={{
                 backgroundImage: `url('https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
            <h1 className="text-5xl font-bold mb-6">
              About <span className="gradient-text animate-pulse-slow">CraftLab</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We're revolutionizing career development by eliminating barriers between talented individuals and meaningful opportunities through intelligent technology and verified credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 animate-fadeInUp">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeInLeft">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                CraftLab exists to bridge the gap between education and employment by creating an intelligent ecosystem where talent meets opportunity. We believe that traditional job application processes are broken and that there's a better way to connect organizations with the right people.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform empowers young professionals, students, and career-changers with the tools they need to showcase their potential while providing organizations with access to verified, skilled candidates through AI-driven matching.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl hover-lift animate-fadeInRight">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 animate-float">
                    <Target className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Vision</h3>
                    <p className="text-gray-600">A world where every person has access to career opportunities that match their potential and aspirations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 animate-float" style={{animationDelay: '1s'}}>
                    <Lightbulb className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                    <p className="text-gray-600">Leveraging AI and technology to create smarter, more efficient career development solutions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20 relative bg-overlay"
               style={{
                 backgroundImage: `url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="glass bg-white/90 backdrop-blur-lg p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex justify-center mb-6 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 animate-fadeInUp">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools designed for modern career development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center animate-fadeInUp hover-lift" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
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

      {/* How We Help Section */}
      <section className="bg-black text-white py-20 animate-gradient"
               style={{
                 background: 'linear-gradient(-45deg, #000000, #1f2937, #111827, #000000)',
                 backgroundSize: '400% 400%'
               }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="animate-fadeInLeft">
              <h2 className="text-4xl font-bold mb-6">How We're Different</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No More Applications</h3>
                    <p className="text-gray-300">Our AI matches you with opportunities automatically. No more endless applications or waiting for responses.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Verified Credentials</h3>
                    <p className="text-gray-300">Partner with universities and institutions to verify your achievements and build trust with employers.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Professional Portfolio</h3>
                    <p className="text-gray-300">Automatically generate professional CVs and portfolios that showcase your unique strengths and experiences.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-fadeInRight">
              <h2 className="text-4xl font-bold mb-6">For Organizations</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Pre-Qualified Candidates</h3>
                    <p className="text-gray-300">Receive only the most relevant candidates, pre-screened and ranked by our AI matching system.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Verified Talent</h3>
                    <p className="text-gray-300">All candidates have verified credentials and achievements, reducing hiring risks and improving quality.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Efficient Process</h3>
                    <p className="text-gray-300">Streamlined hiring process that saves time and resources while finding the best talent for your organization.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;