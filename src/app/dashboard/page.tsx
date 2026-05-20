'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

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

  const [user, setUser] = useState<MeResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const data = await apiRequest<MeResponse>('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <button onClick={logout} className="buttonMain rounded-lg border px-4 py-2">
            Logout
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Your credits</p>
          <h2 className="text-4xl font-bold">{user?.credits?.balance ?? 0}</h2>
        </div>
      </div>
    </main>
  );
}