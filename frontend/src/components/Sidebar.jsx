import React from 'react';
import {
  LayoutDashboard,
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  ReceiptText,
  ShieldAlert,
  CreditCard,
  PlusCircle,
  Lock,
  Server
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, user, onOpenNewAccountModal }) {
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_BANKER';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transfer', label: 'Fund Transfer', icon: Send },
    { id: 'deposit', label: 'Deposit Money', icon: ArrowDownCircle },
    { id: 'withdraw', label: 'Withdrawal', icon: ArrowUpCircle },
    { id: 'statement', label: 'Account Ledger', icon: ReceiptText },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldAlert, highlight: true });
  }

  return (
    <aside className="w-64 border-r border-gray-800 bg-[#0B0F19] flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)] p-4">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3">
            Main Menu
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? (item.highlight ? 'text-rose-400' : 'text-indigo-400') : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Account Actions */}
        <div className="pt-2 border-t border-gray-800/60">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3">
            Account Services
          </span>
          <div className="mt-2 space-y-2">
            <button
              onClick={onOpenNewAccountModal}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 bg-gray-900/60 hover:bg-gray-800 border border-gray-800 transition"
            >
              <div className="flex items-center space-x-2">
                <PlusCircle className="h-4 w-4 text-cyan-400" />
                <span>Open New Account</span>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">Instant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Security Status</span>
          </div>
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Spring Security 6 with JWT Stateless Verification & Role-Based RBAC Protection.
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 text-[10px] text-gray-400 font-mono">
          <span>Backend: Spring 3.3</span>
          <span className="text-cyan-400">MySQL 8.0</span>
        </div>
      </div>
    </aside>
  );
}
