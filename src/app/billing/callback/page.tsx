'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';

type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

type PaymentStatusResponse = {
  payment: {
    id: string;
    packageId: string;
    credits: number;
    unlimited: boolean;
    amountCents: number;
    currency: string;
    status: PaymentStatus;
  };
};

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15; // ~30s waiting for the gateway webhook to land

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  const [status, setStatus] = useState<PaymentStatus | 'TIMEOUT' | 'ERROR'>(
    'PENDING',
  );
  const [detail, setDetail] = useState<PaymentStatusResponse['payment'] | null>(
    null,
  );

  useEffect(() => {
    if (!paymentId) {
      setStatus('ERROR');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;

      try {
        const data = await apiRequest<PaymentStatusResponse>(
          `/payments/${paymentId}`,
        );

        if (cancelled) {
          return;
        }

        setDetail(data.payment);

        if (data.payment.status === 'PAID' || data.payment.status === 'FAILED') {
          setStatus(data.payment.status);
          return;
        }
      } catch {
        if (cancelled) {
          return;
        }
        setStatus('ERROR');
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        setStatus('TIMEOUT');
        return;
      }

      window.setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  const isSuccess = status === 'PAID';
  const isPending = status === 'PENDING' || status === 'TIMEOUT';

  return (
    <main className="min-h-screen bg-[#f3efeb] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-[#dfd2c7] bg-white p-6 text-center shadow-sm">
        {isSuccess ? (
          <>
            <h1 className="text-2xl font-bold text-[#1f6f43]">
              Payment successful
            </h1>
            <p className="mt-2 text-gray-600">
              {detail?.unlimited
                ? 'Your account now has unlimited credits.'
                : `${detail?.credits ?? ''} credits have been added to your account.`}
            </p>
          </>
        ) : null}

        {status === 'FAILED' ? (
          <>
            <h1 className="text-2xl font-bold text-[#612014]">Payment failed</h1>
            <p className="mt-2 text-gray-600">
              Your payment did not go through. No credits were added and you were
              not charged.
            </p>
          </>
        ) : null}

        {isPending ? (
          <>
            <h1 className="text-2xl font-bold text-[#231815]">
              Confirming your payment...
            </h1>
            <p className="mt-2 text-gray-600">
              {status === 'TIMEOUT'
                ? 'This is taking longer than usual. Your credits will appear on the dashboard once the payment is confirmed.'
                : 'Please wait a moment while we confirm your payment with the provider.'}
            </p>
          </>
        ) : null}

        {status === 'ERROR' ? (
          <>
            <h1 className="text-2xl font-bold text-[#612014]">
              Something went wrong
            </h1>
            <p className="mt-2 text-gray-600">
              We could not read your payment status. If you were charged, your
              credits will still be added automatically.
            </p>
          </>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="buttonMain rounded-lg px-4 py-2"
          >
            Go to dashboard
          </button>
          {!isSuccess ? (
            <button
              type="button"
              onClick={() => router.push('/billing')}
              className="rounded-lg border border-[#d8c6b5] bg-white px-4 py-2 text-sm font-semibold text-[#612014]"
            >
              Back to packages
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#f3efeb]">
          Loading...
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
