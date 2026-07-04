'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthProvider({ children }) {
  const { setSession, setProfile, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        if (mounted) setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (mounted) setProfile(null);
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
          if (pathname !== '/login') router.push('/login');
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          if (session?.user) {
            setLoading(true);
            await fetchProfile(session.user.id);
            setLoading(false);
            if (pathname === '/login') router.push('/');
          } else {
            setProfile(null);
            setLoading(false);
            if (pathname !== '/login') router.push('/login');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setProfile, setLoading, router, pathname]);

  return <>{children}</>;
}
