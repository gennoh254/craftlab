import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'STUDENT' | 'ORGANIZATION'>('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name, userType);
        if (error) setError(error.message);
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT SIDE: Branding & Image Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f0d] p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract background decorative element */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#facc15] opacity-10 blur-[120px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="font-black text-black">CC</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Craftlab Careers</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              {isSignUp ? "Join the future of professional growth." : "Empowering your digital career future."}
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">
              Join the most inclusive ecosystem designed for career growth, 
              skill building, and community integration.
            </p>
          </div>
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0f0d] bg-gray-700 flex items-center justify-center overflow-hidden">
                           <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800" />
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-[#0a0f0d] bg-[#facc15] flex items-center justify-center text-[10px] font-black">
                        +12k
                    </div>
                </div>
                <p className="text-gray-400 text-sm">Over 12,000+ users already onboarded.</p>
            </div>
            <p className="text-gray-600 text-xs">© 2024 Craftlab Technologies. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
                {isSignUp ? "Create an account" : "Sign in to Craftlab"}
            </h2>
            <p className="text-gray-500 font-medium">
                {isSignUp ? "Sign up to start your digital career journey." : "Welcome back! Please enter your details."}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isSignUp ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isSignUp ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15]/20 focus:border-[#facc15] transition-all"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email or Phone</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15]/20 focus:border-[#facc15] transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                    {!isSignUp && (
                        <button type="button" className="text-[11px] font-bold text-[#facc15] hover:underline uppercase tracking-widest">
                            Forgot?
                        </button>
                    )}
                </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15]/20 focus:border-[#facc15] transition-all"
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('STUDENT')}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      userType === 'STUDENT'
                        ? 'bg-black text-[#facc15] border-black'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {userType === 'STUDENT' && <CheckCircle2 className="w-3 h-3" />}
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('ORGANIZATION')}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      userType === 'ORGANIZATION'
                        ? 'bg-black text-[#facc15] border-black'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {userType === 'ORGANIZATION' && <CheckCircle2 className="w-3 h-3" />}
                    Organization
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-[#facc15] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-8 font-medium">
            By continuing, you agree to our <span className="text-gray-900 underline cursor-pointer">Terms of Service</span> and <span className="text-gray-900 underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;