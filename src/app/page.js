'use client';

import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/lib/store/useAuthStore';
import ProductGrid from '@/components/pos/ProductGrid';
import Cart from '@/components/pos/Cart';

export default function Home() {
  const { profile } = useAuthStore();

  if (profile?.status !== 'approved') {
    return (
      <PageLayout title="Access Pending">
        <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Account Pending Approval</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your account has been created successfully, but it needs to be approved by an administrator before you can access the POS terminal. Please contact your manager.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="POS Terminal">
      <div className="h-full flex flex-col md:flex-row gap-6">
        <ProductGrid />
        <Cart />
      </div>
    </PageLayout>
  );
}
