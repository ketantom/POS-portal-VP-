'use client';

import { supabase } from '@/lib/supabase/client';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { session, isLoading } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Success! Please check your email to confirm your account (or just sign in if confirmations are disabled).');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      // Generate a fresh email every time to bypass specific email rate limits
      const uniqueEmail = `admin_${Date.now()}@pos.com`;
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'password123',
      });
      
      if (signUpError) {
        if (signUpError.message.includes('rate limit')) {
          throw new Error('Supabase Rate Limit hit! Please ensure you have turned OFF "Confirm email" in Supabase Authentication -> Providers -> Email. Once that is OFF, you can try again.');
        }
        throw signUpError;
      }
      
      // Since it's a new unique email, if Confirm Email is OFF, they are already logged in via signUp.
      // We just need to wait a moment for the session to propagate, or explicitly sign in if needed.
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        // Try manual sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: uniqueEmail,
          password: 'password123',
        });
        
        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
             throw new Error('ACTION REQUIRED: Supabase is waiting for email confirmation.\n\nGo to your Supabase Dashboard -> Authentication -> Providers -> Email -> Turn OFF "Confirm email" and try again.');
          } else {
             throw signInError;
          }
        }
      }
      
      router.push('/');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  };

  if (isLoading || session) return <div className="h-screen flex items-center justify-center text-white bg-[#0a0a0a]">Loading...</div>;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#0a0a0a]">
      {/* Left branding panel */}
      <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-purple-900 via-blue-900 to-black p-12 justify-between border-r border-gray-800/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
            POS
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Streamline your retail operations.
          </h1>
          <p className="text-xl text-blue-200/70 font-medium">
            Fast, secure, and intuitive point of sale system powered by Next.js and Supabase.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-gray-400">Sign in to your account to continue</p>
          </div>

          <div className="mt-8 space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-colors"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In with Email'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0a0a0a] text-gray-500">Developer Shortcut</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 hover:border-gray-600 shadow-lg"
            >
              {loading ? 'Processing...' : '🚀 One-Click Test Login'}
            </button>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            Secure authentication provided by Supabase
          </div>
        </div>
      </div>
    </div>
  );
}
