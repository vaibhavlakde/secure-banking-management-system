import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  TrendingUp,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel({ onShowToast }) {
  const [metrics, setMetrics] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAccount, setSearchAccount] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashData, accsData, txData] = await Promise.all([
        api.getAdminDashboard(),
        api.getAllAccounts(),
        api.getAllTransactions(),
      ]);
      setMetrics(dashData);
      setAccounts(accsData || []);
      setTransactions(txData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to load admin dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleAccountStatus = async (accountNumber, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    setActionLoading(accountNumber);
    try {
      await api.updateAccountStatus(accountNumber, newStatus);
      if (onShowToast) onShowToast(`Account ${accountNumber} is now ${newStatus}`, 'success');
      // Refresh
      await fetchAdminData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to update account status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.accountNumber.toLowerCase().includes(searchAccount.toLowerCase()) ||
      a.customerName?.toLowerCase().includes(searchAccount.toLowerCase()) ||
      a.customerEmail?.toLowerCase().includes(searchAccount.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        <span className="text-sm text-gray-400">Loading Bank Central Administration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-gray-900/60 to-gray-900/90 border border-rose-500/20">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Bank Administration & Oversight</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ROLE_ADMIN
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live Reserve Monitoring, Fraud Prevention, and Account Controls
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 flex items-center space-x-2 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Deposits */}
        <div className="p-5 rounded-2xl bg-gray-900/70 border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Bank Reserves</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">
            ₹{Number(metrics?.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across all customer active balances</p>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-gray-900/70 border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Customers</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {metrics?.totalCustomers || accounts.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Registered verified accounts</p>
        </div>

        {/* Total Volume Inflow */}
        <div className="p-5 rounded-2xl bg-gray-900/70 border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Deposits</span>
            <ArrowDownLeft className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-2">
            ₹{Number(metrics?.totalDeposits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Cumulative credit inflow</p>
        </div>

        {/* Total Outflow */}
        <div className="p-5 rounded-2xl bg-gray-900/70 border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Withdrawals</span>
            <ArrowUpRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-2">
            ₹{Number(metrics?.totalWithdrawals || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">ATM & branch withdrawals</p>
        </div>
      </div>

      {/* Account Management Table */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Customer Account Management</h3>
            <p className="text-xs text-gray-400">Freeze or activate accounts instantaneously</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search account, name..."
              value={searchAccount}
              onChange={(e) => setSearchAccount(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono">
                <th className="pb-3 px-3">Account No</th>
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3 text-right">Balance</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredAccounts.map((acc) => {
                const isFrozen = acc.status === 'FROZEN';
                const isLoading = actionLoading === acc.accountNumber;

                return (
                  <tr key={acc.accountNumber} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-3 font-mono font-semibold text-cyan-400">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-200">{acc.customerName}</div>
                      <div className="text-[11px] text-gray-400">{acc.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isFrozen
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleAccountStatus(acc.accountNumber, acc.status)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ml-auto transition disabled:opacity-50 ${
                          isFrozen
                            ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
                            : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isFrozen ? (
                          <Unlock className="h-3 w-3" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        <span>{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Transaction Audit Log */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Global Bank Transaction Audit Trail</h3>
          <p className="text-xs text-gray-400">Complete immutable record of all banking events</p>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono">
                <th className="pb-3 px-3">Reference UTR</th>
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3">Account</th>
                <th className="pb-3 px-3 text-right">Amount</th>
                <th className="pb-3 px-3">Description</th>
                <th className="pb-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {transactions.slice(0, 15).map((tx) => (
                <tr key={tx.id || tx.referenceNumber} className="hover:bg-gray-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-semibold">{tx.referenceNumber}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      tx.transactionType === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400' :
                      tx.transactionType === 'WITHDRAWAL' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-300">{tx.accountNumber}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                    ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 truncate max-w-xs">{tx.description}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400 font-mono text-[11px]">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
