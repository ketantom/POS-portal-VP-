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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-lighter)] to-white p-4">
      <div className="card w-full max-w-md shadow-xl bg-white/80 backdrop-blur-lg border-white/50 p-8 rounded-2xl">
        <div className="text-center mb-8 animate-bounce-in">
          <Image 
            src="/logo.png" 
            alt="Vijaya Products Logo" 
            width={80} 
            height={80} 
            className="mx-auto mb-4 drop-shadow-md"
            priority
          />
          <h1 className="text-2xl font-extrabold text-[var(--text-dark)] tracking-tight">Welcome Back</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Sign in to your POS Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="input-group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-[var(--danger)] bg-[var(--danger-light)] border border-[var(--danger)]/20 rounded-lg animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 text-base animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-[var(--text-light)] animate-fade-in" style={{ animationDelay: '400ms' }}>
          Vijaya Products © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
