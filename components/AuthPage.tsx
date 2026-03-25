import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* LEFT SIDE: Branding Section with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
        {/* BACKGROUND IMAGE & OVERLAY */}
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
        
        {/* LOGO AREA */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-black text-black">CC</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Craftlab Careers</span>
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            {isSignUp 
              ? "Join Africa's Most Inclusive Financial Network." 
              : "Empowering Africa's digital future."}
          </h1>
          <p className="text-gray-300 text-lg font-medium leading-relaxed">
            {isSignUp 
              ? "Start your journey towards seamless payments, micro-savings, and accessible credit today."
              : "Join the most inclusive financial ecosystem designed for growth and community integration."}
          </p>
        </div>

        {/* BOTTOM STATS / FOOTER */}
        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-[#facc15] flex items-center justify-center text-[10px] font-black">
                        +12k
                    </div>
                </div>
                <p className="text-gray-300 text-sm font-medium">Over 1.2 million users already onboarded.</p>
            </div>
            <p className="text-gray-500 text-xs">© 2024 Craftlab Technologies. All rights reserved.</p>
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
                {isSignUp ? "Sign up to start your digital financial journey." : "Welcome back! Please enter your details."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15]/20 focus:border-[#facc15] transition-all"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Email or Phone Number</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15]/20 focus:border-[#facc15] transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15]/20 focus:border-[#facc15] transition-all"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {!isSignUp && (
                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#facc15] focus:ring-[#facc15]" />
                        <span className="text-xs font-bold text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-xs font-black text-[#facc15] uppercase tracking-widest">
                        Forgot password?
                    </button>
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
              className="w-full py-4 bg-[#facc15] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-500">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 font-black text-[#facc15] uppercase text-xs tracking-widest hover:underline"
                >
                    {isSignUp ? "Sign In" : "Sign Up"}
                </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;