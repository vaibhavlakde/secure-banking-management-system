import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function DepositWithdrawModal({ type, accounts, activeAccount, isOpen, onClose, onSuccess }) {
  const isDeposit = type === 'DEPOSIT';
  const [accountNumber, setAccountNumber] = useState(activeAccount?.accountNumber || accounts[0]?.accountNumber || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const currentAcc = accounts.find((a) => a.accountNumber === accountNumber) || activeAccount;

  const quickAmounts = isDeposit
    ? [1000, 2000, 5000, 10000, 25000]
    : [500, 1000, 2000, 5000, 10000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isDeposit && currentAcc && val > parseFloat(currentAcc.balance)) {
      setError(`Insufficient funds. Available: ₹${Number(currentAcc.balance).toLocaleString('en-IN')}`);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isDeposit) {
        result = await api.deposit(accountNumber, val, description || 'Cash Deposit');
      } else {
        result = await api.withdraw(accountNumber, val, description || 'ATM Withdrawal');
      }
      onSuccess(result);
      onClose();
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Transaction could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border ${
              isDeposit
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {isDeposit ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isDeposit ? 'Deposit Funds' : 'Withdraw Cash'}
              </h3>
              <p className="text-xs text-gray-400">
                {isDeposit ? 'Instant Account Credit' : 'Instant ATM / Bank Debit'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Account */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Account
            </label>
            <select
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {accounts.map((a) => (
                <option key={a.accountNumber} value={a.accountNumber}>
                  {a.accountNumber} ({a.accountType}) — Bal: ₹{Number(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-800/70 text-gray-300 hover:bg-indigo-600/30 hover:text-indigo-300 border border-gray-700/60 transition"
                >
                  +₹{q.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isDeposit ? 'e.g. Salary, Cheque deposit, Cash' : 'e.g. Shopping, ATM withdrawal'}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm font-semibold rounded-xl text-white flex items-center space-x-2 shadow-lg transition disabled:opacity-50 ${
                isDeposit
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isDeposit ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                  <span>{isDeposit ? 'Complete Deposit' : 'Confirm Withdrawal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
