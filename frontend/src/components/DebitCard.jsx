import React, { useState } from 'react';
import { Wifi, Copy, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function DebitCard({ account, user }) {
  const [copied, setCopied] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState(false);

  const accNumber = account?.accountNumber || '1001002026';
  const formattedNumber = showFullNumber
    ? `${accNumber.slice(0, 4)} ${accNumber.slice(4, 8)} ${accNumber.slice(8)}`
    : `•••• •••• ${accNumber.slice(-4)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-md h-56 rounded-2xl p-6 text-white overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-indigo-900 via-slate-900 to-black border border-indigo-500/30">
      {/* Background radial accent glow */}
      <div className="absolute -right-12 -top-12 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative h-full flex flex-col justify-between">
        {/* Top bar: Bank Name + Contactless icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
            </div>
            <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              NEXBANK PLATINUM
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
              {account?.status || 'ACTIVE'}
            </span>
            <Wifi className="h-5 w-5 text-gray-400 rotate-90" />
          </div>
        </div>

        {/* EMV Chip & Account Type */}
        <div className="flex items-center justify-between my-2">
          {/* Gold Chip */}
          <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-yellow-600/40 shadow-inner flex items-center justify-center p-1">
            <div className="w-full h-full border border-amber-700/30 rounded grid grid-cols-2 gap-0.5 opacity-60">
              <div className="border-r border-b border-amber-800"></div>
              <div className="border-b border-amber-800"></div>
              <div className="border-r border-amber-800"></div>
              <div></div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">IFSC Code</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{account?.ifscCode || 'SBMS0001024'}</span>
          </div>
        </div>

        {/* Account / Card Number with Toggle and Copy */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase font-mono">Account Number</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullNumber(!showFullNumber)}
                className="text-gray-400 hover:text-white transition"
                title={showFullNumber ? 'Hide Account Number' : 'Show Account Number'}
              >
                {showFullNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition flex items-center space-x-1"
                title="Copy Account Number"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="font-mono text-lg font-semibold tracking-widest text-gray-100 mt-0.5">
            {formattedNumber}
          </div>
        </div>

        {/* Footer: Cardholder Name + Account Type Badge */}
        <div className="flex items-end justify-between pt-2 border-t border-white/10">
          <div>
            <span className="text-[9px] text-gray-400 uppercase block font-mono">Primary Holder</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-200">
              {account?.customerName || user?.fullName || 'VAIBHAV LAKDE'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-gray-400 uppercase block font-mono">Type</span>
            <span className="text-xs font-semibold text-indigo-300">
              {account?.accountType || 'SAVINGS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
