import React from 'react';
import { ShieldCheck, User, LogOut, RefreshCw, Bell, ChevronDown } from 'lucide-react';

export default function Navbar({ user, accounts, activeAccount, onSelectAccount, onRefresh, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur-md px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                NexBank
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                256-bit AES
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Secure Banking Management System</p>
          </div>
        </div>

        {/* Center Account Switcher (if customer has multiple accounts) */}
        {accounts && accounts.length > 0 && (
          <div className="hidden md:flex items-center space-x-3 bg-gray-900/80 border border-gray-800 rounded-xl px-3.5 py-1.5">
            <span className="text-xs text-gray-400 font-medium">Active Account:</span>
            <select
              value={activeAccount?.accountNumber || ''}
              onChange={(e) => {
                const found = accounts.find((a) => a.accountNumber === e.target.value);
                if (found) onSelectAccount(found);
              }}
              className="bg-transparent text-sm font-mono text-cyan-400 font-semibold focus:outline-none cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.accountNumber} value={acc.accountNumber} className="bg-gray-900 text-white">
                  A/C {acc.accountNumber} ({acc.accountType}) - ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-lg bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/80 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* User pill */}
          <div className="flex items-center space-x-3 pl-2 border-l border-gray-800">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-700 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-inner">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-white leading-tight">{user?.fullName || 'User'}</div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-gray-400">{user?.email}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                  user?.role === 'ROLE_ADMIN'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition ml-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
