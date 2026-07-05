'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (isMounted) router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && isMounted) {
          setUserProfile(profile as Profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUser();

    return () => { isMounted = false; };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-gray)]">
        <Image src="/logo.png" alt="Vijaya Products" width={80} height={80} className="animate-pulse mb-4" />
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get title from pathname
  let pageTitle = 'Dashboard';
  if (pathname.includes('/settings/accounts')) pageTitle = 'Account Management';
  else if (pathname.includes('/settings/inventory')) pageTitle = 'Inventory';
  else if (pathname.includes('/settings/payments')) pageTitle = 'Payment Methods';
  else if (pathname.includes('/settings/banking')) pageTitle = 'Banking Details';

  return (
    <div className="min-h-screen bg-[var(--bg-gray)] flex flex-col">
      <Navbar 
        userName={userProfile?.full_name} 
        onMenuToggle={() => setSidebarOpen(true)}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={userProfile?.role}
      />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
