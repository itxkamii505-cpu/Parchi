import React, { useState } from 'react';
import { Lock, KeyRound, Check, X, ShieldAlert } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  clientName?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  clientName,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === correctPin) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeyClick = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Security PIN
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {clientName ? clientName : 'Authorization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Enter 4-digit PIN to download
            <span className="block text-[10px] text-slate-400 mt-0.5">(Default: 1234)</span>
          </p>

          {/* PIN Input Display */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {[0, 1, 2, 3].map((index) => {
              const hasChar = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${
                    error
                      ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30'
                      : hasChar
                      ? 'border-[#002a4e] dark:border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {hasChar ? '•' : ''}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-red-500 mt-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incorrect PIN! Try again.</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === 'C') setPin('');
                else if (k === '⌫') handleBackspace();
                else handleKeyClick(k);
              }}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-all cursor-pointer active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pin.length < 4}
            onClick={() => handleSubmit()}
            className="flex-1 py-2 rounded-xl bg-[#002a4e] hover:bg-blue-900 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
