import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, EyeOff, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'Organizer') {
      setEmail('organizer@stadiumpulse.com');
    } else if (role === 'Volunteer') {
      setEmail('volunteer@stadiumpulse.com');
    } else if (role === 'Staff') {
      setEmail('staff@stadiumpulse.com');
    }
    setPassword('password123');
    setError('');
  };

  return (
    <main id="main-content" className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center focus:outline-none" tabIndex="-1">
      <div className="bg-stadium-slate rounded-2xl border border-stadium-border p-8 shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-fifa-green text-stadium-dark p-3 rounded-full inline-flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white uppercase tracking-wider">Operations Login</h1>
          <p className="text-xs text-slate-400 mt-1">Authenticate to access crowd controls and security protocols.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-fifa-red/10 border border-fifa-red/30 p-3.5 rounded-xl flex gap-2.5 text-xs text-fifa-red mb-6 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. organizer@stadiumpulse.com"
              required
              className="w-full bg-stadium-dark border border-stadium-border rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-fifa-gold"
            />
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-stadium-dark border border-stadium-border rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-fifa-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fifa-green hover:bg-fifa-greenDark text-stadium-dark py-3 rounded-xl font-bold text-xs transition-all hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-amber-500"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-8 pt-6 border-t border-stadium-border/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-3 text-center">Demo Quick Fills</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemoCredentials('Organizer')}
              className="py-2 px-1 bg-stadium-dark border border-stadium-border/60 hover:border-fifa-gold text-slate-300 text-[10px] rounded font-semibold transition-all focus:outline-none"
            >
              Organizer
            </button>
            <button
              onClick={() => fillDemoCredentials('Volunteer')}
              className="py-2 px-1 bg-stadium-dark border border-stadium-border/60 hover:border-fifa-gold text-slate-300 text-[10px] rounded font-semibold transition-all focus:outline-none"
            >
              Volunteer
            </button>
            <button
              onClick={() => fillDemoCredentials('Staff')}
              className="py-2 px-1 bg-stadium-dark border border-stadium-border/60 hover:border-fifa-gold text-slate-300 text-[10px] rounded font-semibold transition-all focus:outline-none"
            >
              Staff
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Login;
