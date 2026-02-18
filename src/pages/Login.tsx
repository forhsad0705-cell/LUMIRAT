import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/songs');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3b2f2f] to-[#f7e9b0]">
    <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mb-4">
          <Music className="text-white w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-neutral-600">
          {mode === 'login' ? 'Sign in to LUMIRAT' : 'Sign up to get started'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        <input
          className="w-full p-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-yellow-400 outline-none"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-yellow-400 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3b2f2f] text-white py-3 rounded-lg hover:bg-[#4a3a3a] transition disabled:opacity-50"
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <p className="text-center mt-6 text-neutral-700">
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <span
          className="text-[#3b2f2f] font-semibold cursor-pointer"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </span>
      </p>
    </div>
  </div>
    );
};