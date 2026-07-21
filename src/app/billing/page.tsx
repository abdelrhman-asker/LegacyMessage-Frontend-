'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

type CreditPackage = {
  id: string;
  label: string;
  credits: number;
  unlimited: boolean;
  amountCents: number;
  price: number;
  currency: string;
};

type PackagesResponse = {
  packages: CreditPackage[];
};

type BalanceResponse = {
  credits: {
    balance: number;
    unlimited: boolean;
  };
};

type CheckoutResponse = {
  paymentId: string;
  checkoutUrl: string;
};

export default function BillingPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [balance, setBalance] = useState<BalanceResponse['credits'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const [packagesData, balanceData] = await Promise.all([
          apiRequest<PackagesResponse>('/credits/packages'),
          apiRequest<BalanceResponse>('/credits'),
        ]);

        if (mounted) {
          setPackages(packagesData.packages);
          setBalance(balanceData.credits);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Could not load packages.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleBuy(pkg: CreditPackage) {
    setError('');
    setBuyingId(pkg.id);

    try {
      const data = await apiRequest<CheckoutResponse>('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ packageId: pkg.id }),
      });

      // Hand off to the gateway's hosted checkout page.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not start the payment.',
      );
      setBuyingId('');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f3efeb]">
        Loading packages...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3efeb] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border border-[#dfd2c7] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#231815]">Add credits</h1>
            <p className="text-gray-500">
              1 credit lets you send 1 message.
            </p>
            <p className="mt-1 text-sm font-semibold text-[#612014]">
              {balance?.unlimited
                ? 'You currently have unlimited credits.'
                : `Current balance: ${balance?.balance ?? 0} credits`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-[#d8c6b5] bg-white px-4 py-2 text-sm font-semibold text-[#612014]"
          >
            Back to dashboard
          </button>
        </div>

        {error ? (
          <p className="rounded-lg border border-[#612014] bg-[#fff8f2] p-4 text-sm text-[#612014]">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => {
            const highlighted = pkg.unlimited;
            return (
              <div
                key={pkg.id}
                className={`flex flex-col rounded-lg border p-5 shadow-sm ${
                  highlighted
                    ? 'border-[#612014] bg-[#fff8f2]'
                    : 'border-[#dfd2c7] bg-white'
                }`}
              >
                <h2 className="text-lg font-bold text-[#231815]">{pkg.label}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pkg.unlimited
                    ? 'Send as many messages as you want.'
                    : `${pkg.credits} message${pkg.credits === 1 ? '' : 's'}`}
                </p>
                <p className="mt-4 text-3xl font-bold text-[#612014]">
                  {pkg.price}
                  <span className="ml-1 text-base font-semibold text-gray-500">
                    {pkg.currency}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => handleBuy(pkg)}
                  disabled={Boolean(buyingId)}
                  className="buttonMain mt-5 rounded-lg px-4 py-2 disabled:opacity-60"
                >
                  {buyingId === pkg.id ? 'Redirecting...' : 'Buy'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400">
          Payments are processed securely by our payment provider. You will be
          redirected to complete your purchase.
        </p>
      </div>
    </main>
  );
}
