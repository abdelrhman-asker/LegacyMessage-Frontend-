'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useI18n } from '@/i18n/I18nProvider';
import Loader from '@/components/Loader';
import waxLogo from '@/../public/wax-logo.png';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ApiError = {
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const [opened, setOpened] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const isSignup = searchParams.get('mode') === 'signup';

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      const token = localStorage.getItem('token');

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        await apiRequest('/auth/me');
        if (mounted) {
          router.replace('/dashboard');
        }
      } catch {
        localStorage.removeItem('token');
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  function validateEmail(value: string): string | null {
    const email = value.trim();
    if (!email) return t('auth.emailRequired');
    if (!EMAIL_REGEX.test(email)) return t('auth.emailInvalid');
    return null;
  }

  function validatePassword(value: string): string | null {
    if (!value.trim()) return t('auth.passwordRequired');
    if (!PASSWORD_REGEX.test(value)) {
      return t('auth.passwordInvalid');
    }
    return null;
  }

  function openEnvelope() {
    if (!opened) {
      setOpened(true);
    }
  }

  function switchMode(nextIsSignup: boolean) {
    setLoginError('');
    setSignupError('');
    router.replace(nextIsSignup ? '/login?mode=signup' : '/login', { scroll: false });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');

    const emailError = validateEmail(loginEmail);
    const passwordError = validatePassword(loginPassword);
    if (emailError || passwordError) {
      setLoginError(emailError || passwordError || t('auth.invalidLogin'));
      return;
    }

    setLoginLoading(true);

    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setLoginError(apiError.message || t('auth.loginFailed'));
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError(t('auth.nameRequired'));
      return;
    }

    const emailError = validateEmail(signupEmail);
    const passwordError = validatePassword(signupPassword);
    if (emailError || passwordError) {
      setSignupError(emailError || passwordError || t('auth.invalidSignup'));
      return;
    }

    setSignupLoading(true);

    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
        }),
      });

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setSignupError(apiError.message || t('auth.registerFailed'));
    } finally {
      setSignupLoading(false);
    }
  }

  const isLocked = loginLoading || signupLoading;
  const loginHasRequiredValues =
    loginEmail.trim().length > 0 && loginPassword.length > 0;
  const signupHasRequiredValues =
    signupName.trim().length > 0 &&
    signupEmail.trim().length > 0 &&
    signupPassword.length > 0;

  if (checkingSession) {
    return (
      <main className="flex min-h-[calc(100vh-74px)] flex-col items-center justify-center bg-[#f7f2e9]">
        <Loader label={t('dashboard.loading')} />
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-74px)] overflow-hidden bg-gradient-to-br from-[#f7f2e9] via-[#f1e8db] to-[#e8dac8]">
      <div className="blob-float pointer-events-none absolute left-[-120px] top-[-80px] h-64 w-64 rounded-full bg-[#d9bc9a]/35 blur-3xl sm:h-96 sm:w-96" />
      <div className="blob-float-2 pointer-events-none absolute bottom-[-140px] right-[-100px] h-64 w-64 rounded-full bg-[#b9895d]/30 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div className="mx-auto flex min-h-[calc(100vh-74px)] w-full max-w-6xl items-center px-4 py-3 sm:px-6 sm:py-4 md:py-5 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#e7d8c6]/90 bg-[#fffbf5]/90 shadow-[0_30px_80px_rgba(47,26,10,0.16)] backdrop-blur-sm lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden border-r border-[#eadbc9] bg-gradient-to-b from-[#ead7c2] to-[#e3ccb1] p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#fff5e7]/40 blur-2xl" />
            <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-[#b17749]/20 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7b4e2d]">
                {t('login.side.kicker')}
              </p>
              <h1 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-tight text-[#352012]">
                {t('login.side.title')}
              </h1>
              <p className="mt-5 max-w-[36ch] text-sm leading-relaxed text-[#6f4f37]">
                {t('login.side.body')}
              </p>
            </div>

            <div className="relative space-y-4">
              <div className="rounded-2xl border border-[#cfaf90]/70 bg-white/45 px-4 py-3 text-sm text-[#553622]">
                {t('login.side.point1')}
              </div>
              <div className="rounded-2xl border border-[#cfaf90]/70 bg-white/45 px-4 py-3 text-sm text-[#553622]">
                {t('login.side.point2')}
              </div>
              <div className="rounded-2xl border border-[#cfaf90]/70 bg-white/45 px-4 py-3 text-sm text-[#553622]">
                {t('login.side.point3')}
              </div>
            </div>
          </section>

          <section className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="relative mx-auto min-h-[500px] w-full sm:min-h-[540px]">
                <div className={`absolute left-1/2 top-[78%] sm:top-[90%]  z-10 w-[92%] max-w-sm -translate-x-1/2 transition-all duration-700 ease-out sm:w-[88%] ${opened ? 'z-50 -translate-y-[80%] opacity-100 sm:-translate-y-[94%]' : 'pointer-events-none translate-y-[10%] opacity-0'}`} style={{ perspective: '1400px' }}>
                  <div className="mb-3 rounded-full border border-[#e9d8c3] bg-[#f9f1e6] p-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button type="button" onClick={() => switchMode(false)} disabled={isLocked} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${!isSignup ? 'bg-[#2f1f14] text-white shadow-md' : 'text-[#6f4f37] hover:bg-[#ecdfcf]'} disabled:cursor-not-allowed disabled:opacity-60`}>
                        {t('auth.login')}
                      </button>
                      <button type="button" onClick={() => switchMode(true)} disabled={isLocked} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${isSignup ? 'bg-[#2f1f14] text-white shadow-md' : 'text-[#6f4f37] hover:bg-[#ecdfcf]'} disabled:cursor-not-allowed disabled:opacity-60`}>
                        {t('auth.signup')}
                      </button>
                    </div>
                  </div>

                  <div className={`relative min-h-[430px] w-full transition-transform duration-700 [transform-style:preserve-3d] sm:min-h-[460px] ${isSignup ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'}`}>
                    <form onSubmit={handleLogin} className="absolute inset-0 flex flex-col rounded-3xl border border-[#e9d8c3] bg-[#fffaf3] p-5 shadow-[0_20px_50px_rgba(56,35,20,0.12)] [backface-visibility:hidden] sm:p-7">
                      <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-[#2b2118] sm:text-3xl">{t('auth.welcomeBack')}</h2>
                        <p className="mt-2 text-sm text-[#806850]">{t('auth.signinSubtitle')}</p>
                      </div>
                      {loginError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loginError}</p>}
                      <div className="space-y-4">
                        <input disabled={isLocked} className="w-full rounded-xl border border-[#dcc9af] bg-white px-4 py-3 text-sm text-[#2b2118] outline-none transition placeholder:text-[#9d8973] focus:border-[#9b6b45] focus:ring-4 focus:ring-[#9b6b45]/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base" placeholder={t('auth.email')} type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                        <input disabled={isLocked} className="w-full rounded-xl border border-[#dcc9af] bg-white px-4 py-3 text-sm text-[#2b2118] outline-none transition placeholder:text-[#9d8973] focus:border-[#9b6b45] focus:ring-4 focus:ring-[#9b6b45]/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base" placeholder={t('auth.password')} type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                      </div>
                      <button disabled={isLocked || !loginHasRequiredValues} className="mt-6 w-full cursor-pointer rounded-xl bg-[#2b2118] py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#4a3424] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base">
                        {loginLoading ? t('auth.loggingIn') : t('auth.login')}
                      </button>
                      <p className="mt-auto pt-5 text-center text-sm text-[#6f5a49]">{t('auth.newHere')} <button type="button" onClick={() => switchMode(true)} className="font-semibold text-[#5f2419] underline underline-offset-2 cursor-pointer" disabled={isLocked}>{t('auth.createAnAccount')}</button></p>
                    </form>

                    <form onSubmit={handleSignup} className="absolute min-h-fit inset-0 flex flex-col rounded-3xl border border-[#e9d8c3] bg-[#fffaf3] p-5 shadow-[0_20px_50px_rgba(56,35,20,0.12)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-7">
                      <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-[#2b2118] sm:text-3xl">{t('auth.createAccount')}</h2>
                        <p className="mt-2 text-sm text-[#806850]">{t('auth.signupSubtitle')}</p>
                      </div>
                      {signupError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{signupError}</p>}
                      <div className="space-y-4">
                        <input disabled={isLocked} className="w-full rounded-xl border border-[#dcc9af] bg-white px-4 py-3 text-sm text-[#2b2118] outline-none transition placeholder:text-[#9d8973] focus:border-[#9b6b45] focus:ring-4 focus:ring-[#9b6b45]/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base" placeholder={t('auth.name')} required value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                        <input disabled={isLocked} className="w-full rounded-xl border border-[#dcc9af] bg-white px-4 py-3 text-sm text-[#2b2118] outline-none transition placeholder:text-[#9d8973] focus:border-[#9b6b45] focus:ring-4 focus:ring-[#9b6b45]/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base" placeholder={t('auth.email')} type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                        <input disabled={isLocked} className="w-full rounded-xl border border-[#dcc9af] bg-white px-4 py-3 text-sm text-[#2b2118] outline-none transition placeholder:text-[#9d8973] focus:border-[#9b6b45] focus:ring-4 focus:ring-[#9b6b45]/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base" placeholder={t('auth.password')} type="password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                      </div>
                      <button disabled={isLocked || !signupHasRequiredValues} className="mt-6 w-full cursor-pointer rounded-xl bg-[#2b2118] py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#4a3424] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base">
                        {signupLoading ? t('auth.creating') : t('auth.signup')}
                      </button>
                      <p className="mt-auto pt-5 text-center text-sm text-[#6f5a49]">{t('auth.haveAccount')} <button type="button" onClick={() => switchMode(false)} className="font-semibold text-[#5f2419] underline underline-offset-2 cursor-pointer" disabled={isLocked}>{t('auth.logIn')}</button></p>
                    </form>
                  </div>
                </div>

                <div className={`absolute bottom-8 left-1/2 z-20 aspect-[520/290] w-full max-w-[520px] -translate-x-1/2 transition-all duration-700 sm:bottom-12 ${opened ? 'translate-y-8 opacity-95 sm:translate-y-16' : 'translate-y-0 opacity-100'}`} style={{ perspective: '1000px' }}>
                  <div className="absolute inset-0 rounded-b-3xl bg-[#c89b6d] shadow-2xl" />
                  <div className="absolute inset-0 bg-[#d8ae7d]" style={{ clipPath: 'polygon(0 0, 50% 100%, 0 100%)' }} />
                  <div className="absolute inset-0 bg-[#d2a06f]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 50% 100%)' }} />
                  <div className="absolute inset-0 z-20 bg-[#b98558]" style={{ clipPath: 'polygon(0 100%, 50% 34%, 100% 100%)' }} />

                  <button type="button" onClick={openEnvelope} disabled={isLocked} className={`absolute inset-0 z-30 origin-top cursor-pointer bg-[#e0b783] transition-transform duration-700 ease-in-out disabled:cursor-not-allowed ${opened ? '[transform:rotateX(180deg)]' : '[transform:rotateX(0deg)]'}`} style={{ clipPath: 'polygon(0 0, 50% 64%, 100% 0)', transformStyle: 'preserve-3d' }} aria-label={t('auth.openEnvelope')} />

                  <button type="button" onClick={openEnvelope} disabled={isLocked} className={`absolute left-1/2 top-[30%] z-40 flex h-24 w-24 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full transition-all duration-500 sm:top-[35%] sm:h-28 sm:w-28 ${opened ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} aria-label={t('auth.openEnvelope')}>
                    <Image src={waxLogo} alt="Wax Seal Logo" className="h-full w-full object-contain cursor-pointer" />
                  </button>

                  {!opened && <div className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2 text-center sm:bottom-8"><p className="whitespace-nowrap text-[11px] font-semibold text-[#3b281d] sm:text-sm">{t('auth.clickSeal')}</p></div>}
                </div>

                <div className="absolute bottom-6 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-full bg-black/10 blur-xl sm:bottom-8" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-74px)] items-center justify-center bg-[#f7f2e9]">
          <Loader />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
