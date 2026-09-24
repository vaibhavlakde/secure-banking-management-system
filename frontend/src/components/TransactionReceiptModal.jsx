import React from 'react';
import { X, CheckCircle2, Printer, ShieldCheck, Download, Share2 } from 'lucide-react';

export default function TransactionReceiptModal({ transaction, isOpen, onClose }) {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.transactionType === 'DEPOSIT' || transaction.transactionType === 'TRANSFER_RECEIVE';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-gray-800 rounded-3xl shadow-2xl p-6 overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Background glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button (hidden on print) */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="relative text-center mt-2">
          {/* Success Check Badge */}
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">Transaction Successful</h3>
          <p className="text-xs text-gray-400 mt-0.5">NexBank Secure Electronic Funds Ledger</p>

          {/* Amount Display */}
          <div className="my-5 py-4 px-6 rounded-2xl bg-gray-900/80 border border-gray-800/80">
            <span className="text-xs text-gray-400 uppercase font-mono block">Amount Processed</span>
            <div className={`text-3xl font-extrabold font-mono mt-1 ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
              {isCredit ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {transaction.status || 'SUCCESS'}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs text-left bg-gray-900/50 p-4 rounded-xl border border-gray-800/60 font-mono">
            <div className="flex justify-between items-center text-gray-400">
              <span>Reference (UTR):</span>
              <span className="text-cyan-400 font-bold tracking-wider">{transaction.referenceNumber}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span>Type:</span>
              <span className="text-gray-200 uppercase font-semibold">{transaction.transactionType}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span>Account:</span>
              <span className="text-gray-200">{transaction.accountNumber}</span>
            </div>

            {transaction.targetAccountNumber && (
              <div className="flex justify-between items-center text-gray-400">
                <span>Beneficiary Account:</span>
                <span className="text-gray-200">{transaction.targetAccountNumber}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-gray-400">
              <span>Description:</span>
              <span className="text-gray-200 text-right truncate max-w-[200px]">{transaction.description || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span>Updated Balance:</span>
              <span className="text-emerald-400 font-bold">
                ₹{Number(transaction.postBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-400 pt-2 border-t border-gray-800">
              <span>Date & Time:</span>
              <span className="text-gray-300 text-[11px]">
                {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Digital Cryptographic Signature Verified</span>
          </div>

          {/* Action buttons (hidden on print) */}
          <div className="mt-6 flex items-center justify-center space-x-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-gray-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
