'use client';

import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { session, isLoading } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
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
      const uniqueEmail = `admin_${Date.now()}@pos.com`;
      
      // Auto-signup dummy user
      const { error: signUpError } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'password123',
      });
      
      if (signUpError && !signUpError.message.includes('already registered')) {
        if (signUpError.message.includes('rate limit')) {
          throw new Error('Supabase Rate Limit hit! Turn OFF "Confirm email" in Supabase.');
        }
        throw signUpError;
      }
      
      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: uniqueEmail,
        password: 'password123',
      });
      if (signInError) throw signInError;
      
      router.push('/');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || session) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-800">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-white flex items-center justify-center">
            <img src="/logo.png" alt="Vijaya Products" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Vijaya <span className="text-red-600">Products</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Sign in to your POS terminal</p>
        </div>

        <div className="space-y-6">
          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="admin@vijaya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900 transition-all font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900 transition-all font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50 shadow-md shadow-red-500/30"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Test Login Button */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all border border-gray-200 disabled:opacity-50"
            >
              🚀 Developer Bypass Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
