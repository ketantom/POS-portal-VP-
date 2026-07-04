import PageLayout from '@/components/layout/PageLayout';
import { Settings, Store, Users, Receipt, Database } from 'lucide-react';

export default function SettingsPage() {
  const settingCards = [
    { title: 'Store Details', icon: Store, desc: 'Update receipt header and GSTIN' },
    { title: 'Staff Accounts', icon: Users, desc: 'Manage cashiers and permissions' },
    { title: 'Payment Methods', icon: Receipt, desc: 'Configure UPI and accounts' },
    { title: 'Database Backup', icon: Database, desc: 'Export all POS data' },
  ];

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500 mb-8 font-medium">Manage your POS terminal configuration and preferences.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </PageLayout>
  );
}
