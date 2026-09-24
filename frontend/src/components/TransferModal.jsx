import React, { useState } from 'react';
import { X, Send, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function TransferModal({ accounts, activeAccount, isOpen, onClose, onSuccess }) {
  const [fromAcc, setFromAcc] = useState(activeAccount?.accountNumber || accounts[0]?.accountNumber || '');
  const [toAcc, setToAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [beneficiary, setBeneficiary] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: PIN Confirm

  if (!isOpen) return null;

  const currentSource = accounts.find((a) => a.accountNumber === fromAcc) || activeAccount;

  const handleVerifyBeneficiary = async () => {
    if (!toAcc || toAcc.length < 5) {
      setError('Please enter a valid recipient account number');
      return;
    }
    if (toAcc === fromAcc) {
      setError('Source and destination accounts cannot be identical');
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const res = await api.verifyBeneficiary(toAcc);
      setBeneficiary(res);
    } catch (err) {
      setBeneficiary(null);
      setError(err.message || 'Beneficiary account not found or inactive');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (currentSource && numAmount > parseFloat(currentSource.balance)) {
      setError(`Insufficient balance. Available: ₹${Number(currentSource.balance).toLocaleString('en-IN')}`);
      return;
    }

    if (!toAcc) {
      setError('Please provide a destination account number');
      return;
    }

    setStep(2);
  };

  const handleExecuteTransfer = async () => {
    if (pin.length < 4) {
      setError('Please enter your 4-digit transaction PIN (Use: 1234)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.transfer(fromAcc, toAcc, amount, description || 'Direct Fund Transfer');
      onSuccess(result);
      onClose();
      // Reset
      setStep(1);
      setToAcc('');
      setAmount('');
      setDescription('');
      setPin('');
      setBeneficiary(null);
    } catch (err) {
      setError(err.message || 'Transfer failed. Please check balance and account details.');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Instant Fund Transfer</h3>
              <p className="text-xs text-gray-400">Atomic NEFT / IMPS Bank Transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmitStep1} className="mt-5 space-y-4">
            {/* From Account */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                From Account
              </label>
              <select
                value={fromAcc}
                onChange={(e) => setFromAcc(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                {accounts.map((a) => (
                  <option key={a.accountNumber} value={a.accountNumber}>
                    {a.accountNumber} ({a.accountType}) — Available: ₹{Number(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Account Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Recipient Account Number
                </label>
                <button
                  type="button"
                  onClick={handleVerifyBeneficiary}
                  disabled={verifying || !toAcc}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                >
                  {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>Verify Name</span>
                </button>
              </div>
              <input
                type="text"
                value={toAcc}
                onChange={(e) => {
                  setToAcc(e.target.value);
                  setBeneficiary(null);
                }}
                placeholder="e.g. 1001002027 (Priya Sharma Demo)"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                required
              />

              {beneficiary && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Verified: <strong>{beneficiary.customerName}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">{beneficiary.accountType}</span>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Transfer Amount (₹)
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

              {/* Quick Amount Chips */}
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

            {/* Description / Remarks */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Remarks / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent, Grocery share, Loan repayment"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action buttons */}
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
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Confirmation & Security PIN */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>From Account</span>
                <span className="font-mono text-white font-semibold">{fromAcc}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>To Account</span>
                <span className="font-mono text-cyan-400 font-semibold">{toAcc}</span>
              </div>
              {beneficiary && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Beneficiary Name</span>
                  <span className="text-emerald-400 font-semibold">{beneficiary.customerName}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
                <span>Total Transfer Amount</span>
                <span className="text-base font-bold text-white font-mono">
                  ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* PIN Entry */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Security Authorization PIN (Enter: 1234)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full tracking-widest text-center text-xl font-mono bg-gray-900 border border-gray-800 rounded-xl py-2.5 text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <p className="text-[11px] text-gray-400 text-center mt-1">
                Protected by 256-bit encryption & ACID database rollback
              </p>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:text-white bg-gray-900 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={loading}
                className="px-6 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Authorize Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
