import Image from "next/image";
import Link from "next/link";
import logo from "@/../public/rounded logo.svg";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#f5efe6] text-[#221912]">
      <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#c88f62]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-[#7a2a21]/10 blur-3xl" />

      <section id="top" className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#d9c6ae] bg-[#fff8ee] px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a2a1f]">
              Legacy Messaging Platform
            </p>
            <h1 className="max-w-[14ch] text-4xl font-semibold leading-[1.05] text-[#25170f] sm:text-5xl lg:text-6xl">
              Preserve your words for the moments that matter most.
            </h1>
            <p className="mt-5 max-w-[52ch] text-sm leading-7 text-[#614c3d] sm:text-base">
              Lastdot helps you write meaningful messages, attach voice and memories, and deliver them securely when timing matters most.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?mode=signup" className="inline-flex cursor-pointer items-center rounded-full bg-[#2f1d13] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#4a2c1b]">
                Get Started
              </Link>
              <a href="#tiers" className="inline-flex cursor-pointer items-center rounded-full border border-[#d5bda2] bg-[#fff8ed] px-6 py-3 text-sm font-semibold text-[#4f2d1f] transition hover:bg-[#f5e7d5]">
                View Plans
              </a>
            </div>
          </div>

          <div className="relative rounded-3xl border border-[#e2d2bf] bg-gradient-to-b from-[#fffaf3] to-[#f1e3d2] p-6 shadow-[0_24px_60px_rgba(50,27,12,0.15)] sm:p-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8f5a3c]">How it works</p>
            <div className="space-y-4 text-sm text-[#493424]">
              <div className="rounded-2xl border border-[#eadcca] bg-white/70 p-4">
                <p className="font-semibold">1. Compose your message</p>
                <p className="mt-1 text-[#6b5545]">Write letters, upload photos, and record voice notes.</p>
              </div>
              <div className="rounded-2xl border border-[#eadcca] bg-white/70 p-4">
                <p className="font-semibold">2. Protect with trusted delivery</p>
                <p className="mt-1 text-[#6b5545]">Set recipients and release conditions with confidence.</p>
              </div>
              <div className="rounded-2xl border border-[#eadcca] bg-white/70 p-4">
                <p className="font-semibold">3. Leave a lasting legacy</p>
                <p className="mt-1 text-[#6b5545]">Your words arrive with clarity, care, and timing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="space-y-14 pb-16">
        <section id="mission" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#e3d4c3] bg-[#fffaf4] p-6 shadow-[0_18px_50px_rgba(54,30,12,0.08)] sm:p-9">
            <h2 className="text-3xl font-semibold text-[#2b1c13] sm:text-4xl">A modern vault for meaningful communication</h2>
            <p className="mt-4 max-w-[70ch] text-sm leading-7 text-[#625141] sm:text-base">
              We believe no important word should be lost. Lastdot preserves your voice and intentions so your loved ones can receive comfort, clarity, and guidance when it matters most.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-[#eadcca] bg-white p-4">
                <h3 className="font-semibold text-[#362318]">Intent</h3>
                <p className="mt-1 text-sm text-[#685442]">Thoughtfully crafted messages with purpose.</p>
              </article>
              <article className="rounded-2xl border border-[#eadcca] bg-white p-4">
                <h3 className="font-semibold text-[#362318]">Security</h3>
                <p className="mt-1 text-sm text-[#685442]">Protected storage with trusted access controls.</p>
              </article>
              <article className="rounded-2xl border border-[#eadcca] bg-white p-4">
                <h3 className="font-semibold text-[#362318]">Continuity</h3>
                <p className="mt-1 text-sm text-[#685442]">Bridge generations through timeless memories.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="tiers" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-[#2b1c13] sm:text-4xl">Simple plans, long-term peace of mind</h2>
            <p className="mt-2 text-sm text-[#675342] sm:text-base">Choose the plan that fits your story and your family.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-[#e2d1bd] bg-[#fff8f0] p-6">
              <h3 className="text-xl font-semibold text-[#2a1a12]">The Scroll</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#866247]">Essential Legacy</p>
              <ul className="mt-4 space-y-2 text-sm text-[#5f4b3c]">
                <li>Single secured message</li>
                <li>Digital preservation</li>
                <li>Verified delivery</li>
              </ul>
            </article>
            <article className="rounded-3xl border-2 border-[#5a2b1d] bg-[#fffaf5] p-6 shadow-[0_16px_34px_rgba(65,34,20,0.12)]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a3124]">Most Chosen</p>
              <h3 className="text-xl font-semibold text-[#2a1a12]">The Vault</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#866247]">Rich Narrative</p>
              <ul className="mt-4 space-y-2 text-sm text-[#5f4b3c]">
                <li>Multiple text relics</li>
                <li>Voice recordings</li>
                <li>Photo memory storage</li>
                <li>Scheduled releases</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-[#e2d1bd] bg-[#fff8f0] p-6">
              <h3 className="text-xl font-semibold text-[#2a1a12]">The Estate</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#866247]">Comprehensive Trust</p>
              <ul className="mt-4 space-y-2 text-sm text-[#5f4b3c]">
                <li>Comprehensive life narrative</li>
                <li>Multi-generational trust</li>
                <li>Concierge archival service</li>
              </ul>
            </article>
          </div>
        </section>
      </main>

      <section className="mx-auto mb-12 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#4f2318] to-[#7a3124] px-6 py-10 text-center sm:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Your words deserve the right moment.</h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-sm leading-7 text-[#f4e7dc] sm:text-base">
            Start building a secure archive for your loved ones today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login?mode=signup" className="inline-flex cursor-pointer items-center rounded-full bg-[#fff4e7] px-6 py-3 text-sm font-semibold text-[#4f2419] transition hover:bg-white">
              Start Writing
            </Link>
            <a href="#mission" className="inline-flex cursor-pointer items-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5d5c3] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <div className="w-24" aria-hidden>
            <Image src={logo} alt="Lastdot Logo" />
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6c5646]">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Archive Access</p>
          </div>
          <p className="text-xs text-[#7d6858]">© 2026 Lastdot. All correspondence secured.</p>
        </div>
      </footer>
    </div>
  );
}
