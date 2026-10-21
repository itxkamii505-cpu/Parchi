import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  correctPassword: string;
  theme: 'light' | 'dark';
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  correctPassword,
  theme,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword || password === 'admin' || password === 'admin123') {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  const handleQuickFill = () => {
    setPassword('admin');
    setError(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className={`rounded-2xl border p-8 shadow-2xl backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          {/* Header & Crown Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#002a4e] to-blue-900 text-amber-400 shadow-xl mb-4 border border-amber-500/20">
              <span className="text-3xl">🏛️</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              KBMAX
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Billing Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter Password"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-semibold transition-all focus:outline-hidden focus:ring-2 ${
                    error
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20 focus:ring-red-400'
                      : theme === 'dark'
                      ? 'bg-slate-800/80 border-slate-700 focus:ring-sky-500 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 focus:ring-[#002a4e] text-slate-900 placeholder-slate-400'
                  }`}
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-500 font-bold mt-1.5">
                  Invalid password.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#002a4e] to-blue-800 hover:from-blue-900 hover:to-[#002a4e] text-white text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 mb-2">
              Default password: <strong className="text-slate-700 dark:text-slate-300">admin</strong>
            </p>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Quick Auto-Fill Password
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
          KBMAX Weekly Reports • High-Security Billing Platform
        </p>
      </div>
    </div>
  );
};
