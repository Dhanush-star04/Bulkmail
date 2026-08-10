import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('bulkmail_admin', email);
        onLogin(email);
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Network error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-red-600 mb-1 text-center">BulkMail</h1>
        <p className="text-sm text-zinc-400 mb-6 text-center">Admin Login</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300">Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg p-3 text-sm text-white placeholder-zinc-500 outline-none transition"
              placeholder="Dhanush"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg p-3 text-sm text-white placeholder-zinc-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-sm transition ${
              loading
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-900/40'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}