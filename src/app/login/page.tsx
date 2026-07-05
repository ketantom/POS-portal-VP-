'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rose-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white p-8 sm:p-10 rounded-[32px] relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center p-4 animate-scale-in">
            <Image 
              src="/logo.png" 
              alt="Vijaya Products Logo" 
              width={100} 
              height={100} 
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Sign in to your POS Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/60 border border-slate-200/60 rounded-2xl px-5 py-3.5 outline-none focus:border-slate-400 focus:bg-white focus:shadow-md transition-all placeholder:text-slate-400 font-medium text-slate-700"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 border border-slate-200/60 rounded-2xl px-5 py-3.5 outline-none focus:border-slate-400 focus:bg-white focus:shadow-md transition-all placeholder:text-slate-400 font-medium text-slate-700"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-4 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 text-sm font-bold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 shadow-[0_4px_14px_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Vijaya Products © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
