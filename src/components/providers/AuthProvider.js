'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthProvider({ children }) {
  const { setSession, setProfile, setIsLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    let authSubscription;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          setSession(session);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profileData) {
            setProfile(profileData);
          }
          
          if (pathname === '/login') {
            router.push('/');
          }
        } else {
          setSession(null);
          setProfile(null);
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
        }
        if (pathname === '/login') {
          router.push('/');
        }
      } else {
        setSession(null);
        setProfile(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setIsLoading(false);
    });
    
    authSubscription = data.subscription;

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [setSession, setProfile, setIsLoading, router, pathname]);

  if (!mounted) return null;

  return <>{children}</>;
}
