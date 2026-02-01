import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
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
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#facc15] rounded-3xl mb-4 shadow-2xl">
            <span className="text-4xl font-black text-black">CC</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Craftlab Careers</h1>
          <p className="text-gray-400 font-medium">Connect. Build. Grow.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isSignUp ? 'bg-black text-[#facc15] shadow-lg' : 'text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isSignUp ? 'bg-black text-[#facc15] shadow-lg' : 'text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('STUDENT')}
                    className={`py-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                      userType === 'STUDENT'
                        ? 'bg-black text-[#facc15] border-black shadow-lg'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('ORGANIZATION')}
                    className={`py-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                      userType === 'ORGANIZATION'
                        ? 'bg-black text-[#facc15] border-black shadow-lg'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Organization
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-[#facc15] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
