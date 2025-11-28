"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Placeholder: wire to real login API later
    try {
      setTimeout(() => {
        setMessage('Login stub - hook this up to a real auth API later.');
        setLoading(false);
      }, 600);
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f0de]">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#fffaf1] border border-[#e2d4b7] rounded-lg shadow-md px-8 py-10">
          <h1 className="text-2xl font-semibold text-center text-[#1f3b2c] mb-2">Welcome Back</h1>
          <p className="text-xs text-center text-[#6b7280] mb-8">
            Log in to your AgriLink account.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-[#e5e7eb] bg-[#fdf6e9] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#166534]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-[#e5e7eb] bg-[#fdf6e9] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#166534]"
                required
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
            {message && <p className="text-xs text-green-700">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-[#166534] py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6b7280]">
            Don't have an account?{' '}
            <Link href="/register" className="underline hover:text-[#166534]">
              Register here
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
