'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useI18n } from '@/i18n/I18nProvider';

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    credits?: {
      balance: number;
    };
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [user, setUser] = useState<MeResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const data = await apiRequest<MeResponse>('/auth/me');
        if (mounted) {
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        {t('dashboard.loading')}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.welcome', { name: user?.name ?? 'User' })}</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="buttonMain rounded-lg border px-4 py-2">
            {t('dashboard.logout')}
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">{t('dashboard.credits')}</p>
          <h2 className="text-4xl font-bold">{user?.credits?.balance ?? 0}</h2>
        </div>
      </div>
    </main>
  );
}
