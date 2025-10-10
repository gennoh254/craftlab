import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Users, Building } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'individual'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        userType: 'individual'
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8 text-yellow-400" />,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "hello@craftlab.com",
      action: "mailto:hello@craftlab.com"
    },
    {
      icon: <Phone className="h-8 w-8 text-yellow-400" />,
      title: "Call Us",
      description: "Speak directly with our support team",
      contact: "+254 700 123 456",
      action: "tel:+254700123456"
    },
    {
      icon: <MapPin className="h-8 w-8 text-yellow-400" />,
      title: "Visit Us",
      description: "Come visit our offices in Nairobi",
      contact: "Nairobi, Kenya",
      action: "https://maps.google.com"
    }
  ];

  const faqs = [
    {
      question: "How does the AI matching system work?",
      answer: "Our AI analyzes your profile, skills, experience, and preferences to match you with relevant opportunities. Organizations receive ranked lists of candidates, eliminating the traditional application process."
    },
    {
      question: "Is CraftLab free for students and job seekers?",
      answer: "Yes! CraftLab is completely free for individuals. Our mission is to democratize access to career opportunities for everyone."
    },
    {
      question: "How do you verify certificates and credentials?",
      answer: "We partner directly with universities and certification bodies to verify academic and professional credentials. Verified documents display special badges and can be trusted by employers."
    },
    {
      question: "What types of opportunities are available?",
      answer: "We offer internships, volunteer positions, apprenticeships, and attachment programs across various industries and skill levels."
    }
  ];

  return (
    <div className="space-y-0 page-transition">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 relative bg-overlay"
               style={{
                 backgroundImage: `url('https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
            <h1 className="text-5xl font-bold mb-6">
              Get in <span className="gradient-text animate-pulse-slow">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Have questions about CraftLab? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 animate-fadeInUp">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="text-center p-8 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex justify-center mb-6 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {method.description}
                </p>
                <p className="text-yellow-600 font-semibold">
                  {method.contact}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 py-20 relative bg-overlay"
               style={{
                 backgroundImage: `url('https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="animate-fadeInLeft">
                <h2 className="text-4xl font-bold text-white mb-6">Send us a Message</h2>
                <p className="text-lg text-gray-300 mb-8">
                  Fill out the form below and our team will get back to you within 24 hours. We're here to help with any questions about our platform.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MessageCircle className="h-6 w-6 text-yellow-400 mt-1 animate-float" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">General Inquiries</h3>
                      <p className="text-gray-300">Questions about our platform and services</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Users className="h-6 w-6 text-yellow-400 mt-1 animate-float" style={{animationDelay: '1s'}} />
                    <div>
                      <h3 className="font-semibold text-white mb-1">For Students</h3>
                      <p className="text-gray-300">Support with profiles, matching, and opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Building className="h-6 w-6 text-yellow-400 mt-1 animate-float" style={{animationDelay: '2s'}} />
                    <div>
                      <h3 className="font-semibold text-white mb-1">For Organizations</h3>
                      <p className="text-gray-300">Partnership opportunities and platform features</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass bg-white/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/20 hover-lift animate-fadeInRight">
                {submitted ? (
                  <div className="text-center py-8 animate-fadeInUp">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Message Sent!</h3>
                    <p className="text-gray-600">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                        I am a...
                      </label>
                      <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      >
                        <option value="individual">Student/Individual</option>
                        <option value="organization">Organization</option>
                        <option value="university">University/Institution</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all hover-lift flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 animate-fadeInUp">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fadeInUp">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about CraftLab and how it works
              </p>
            </div>

            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;