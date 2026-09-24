import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DebitCard from './components/DebitCard';
import TransferModal from './components/TransferModal';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import TransactionReceiptModal from './components/TransactionReceiptModal';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import {
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Search,
  Download,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Plus
} from 'lucide-react';
import { api, getToken, removeToken, getStoredUser } from './services/api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(!getToken());
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [depositWithdrawModal, setDepositWithdrawModal] = useState({ isOpen: false, type: 'DEPOSIT' });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [newAccType, setNewAccType] = useState('SAVINGS');
  const [newAccDeposit, setNewAccDeposit] = useState('2000');

  // Filter for transactions
  const [txFilter, setTxFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial Data Fetch
  const loadData = async () => {
    if (!getToken()) {
      setIsLoginOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch user accounts
      const accs = await api.getMyAccounts();
      setAccounts(accs || []);

      if (accs && accs.length > 0) {
        // preserve currently selected or default to first
        const current = activeAccount
          ? accs.find((a) => a.accountNumber === activeAccount.accountNumber) || accs[0]
          : accs[0];
        setActiveAccount(current);

        // 2. Fetch transactions for active account
        const txs = await api.getHistory(current.accountNumber);
        setTransactions(txs || []);
      }
    } catch (err) {
      console.warn('Backend connection notice:', err.message);
      // If token expired, open login
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When active account changes, reload its transactions
  const handleSelectAccount = async (acc) => {
    setActiveAccount(acc);
    try {
      const txs = await api.getHistory(acc.accountNumber);
      setTransactions(txs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (authData) => {
    setUser({
      id: authData.id,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      primaryAccountNumber: authData.primaryAccountNumber,
    });
    setIsLoginOpen(false);
    showToast(`Welcome, ${authData.fullName}! Signed in successfully.`);
    loadData();
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setAccounts([]);
    setActiveAccount(null);
    setTransactions([]);
    setIsLoginOpen(true);
    setTab('dashboard');
    showToast('Signed out of banking session.', 'info');
  };

  const handleTransactionSuccess = (txResult) => {
    showToast(`Transaction processed successfully! Ref: ${txResult.referenceNumber}`);
    setSelectedReceipt(txResult);
    loadData();
  };

  const handleCreateNewAccount = async (e) => {
    e.preventDefault();
    try {
      const newAcc = await api.createAccount(newAccType, parseFloat(newAccDeposit) || 0);
      showToast(`New ${newAcc.accountType} account generated: ${newAcc.accountNumber}`);
      setIsNewAccountOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to create account', 'error');
    }
  };

  // Filtered transactions list
  const filteredTransactions = transactions.filter((t) => {
    if (txFilter !== 'ALL' && t.transactionType !== txFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.referenceNumber.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)) ||
        (t.targetAccountNumber && t.targetAccountNumber.includes(term))
      );
    }
    return true;
  });

  // Calculate monthly stats from loaded transactions
  const monthlyInflow = transactions
    .filter((t) => t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_RECEIVE')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const monthlyOutflow = transactions
    .filter((t) => t.transactionType === 'WITHDRAWAL' || t.transactionType === 'TRANSFER_SEND')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#070B13] text-gray-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-3 text-sm backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'info'
                ? 'bg-gray-900/90 border-gray-700 text-gray-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={handleSelectAccount}
        onRefresh={loadData}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setTab={setTab}
          user={user}
          onOpenNewAccountModal={() => setIsNewAccountOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Admin Portal Tab */}
          {currentTab === 'admin' ? (
            <AdminPanel onShowToast={showToast} />
          ) : (
            <>
              {/* Dashboard Hero Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Financial Overview
                    </h1>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Welcome back, <strong className="text-gray-200">{user?.fullName || 'Customer'}</strong>. Here is your real-time bank ledger.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsTransferOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                    <span>Transfer Money</span>
                  </button>
                  <button
                    onClick={() => setDepositWithdrawModal({ isOpen: true, type: 'DEPOSIT' })}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-semibold text-xs flex items-center space-x-2 transition"
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    <span>Deposit</span>
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Available Balance Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-gray-900/60 to-gray-900/90 border border-indigo-500/20 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <div className="text-3xl font-extrabold text-white font-mono mt-2">
                    ₹{Number(activeAccount?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2 text-xs text-cyan-400 font-mono">
                    <span>A/C: {activeAccount?.accountNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Total Monthly Credits */}
                <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Credits</span>
                    <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
                    +₹{Number(monthlyInflow).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">Deposits & incoming transfers</span>
                </div>

                {/* Total Monthly Debits */}
                <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Debits</span>
                    <ArrowUpRight className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold text-rose-400 font-mono mt-2">
                    -₹{Number(monthlyOutflow).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">Transfers & cash withdrawals</span>
                </div>

                {/* Active Accounts Count */}
                <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Accounts</span>
                    <Building className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-2">
                    {accounts.length} Accounts
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">Primary: {activeAccount?.accountType || 'SAVINGS'}</span>
                </div>
              </div>

              {/* Main Grid: Card + Quick Operations | Transaction Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 5 Cols: Debit Card & Quick Operations */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Digital Debit Card */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-indigo-400" />
                      <span>Virtual Platinum Card</span>
                    </h3>
                    <DebitCard account={activeAccount} user={user} />
                  </div>

                  {/* Quick Action Matrix */}
                  <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Instant Banking Operations
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setIsTransferOpen(true)}
                        className="p-3.5 rounded-xl bg-gray-800/60 hover:bg-indigo-600/20 border border-gray-700/60 hover:border-indigo-500/40 text-left transition group"
                      >
                        <Send className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition" />
                        <div className="font-semibold text-sm text-white mt-2">Fund Transfer</div>
                        <div className="text-[11px] text-gray-400">P2P, NEFT & IMPS</div>
                      </button>

                      <button
                        onClick={() => setDepositWithdrawModal({ isOpen: true, type: 'DEPOSIT' })}
                        className="p-3.5 rounded-xl bg-gray-800/60 hover:bg-emerald-600/20 border border-gray-700/60 hover:border-emerald-500/40 text-left transition group"
                      >
                        <ArrowDownCircle className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition" />
                        <div className="font-semibold text-sm text-white mt-2">Deposit Funds</div>
                        <div className="text-[11px] text-gray-400">Cash & online credit</div>
                      </button>

                      <button
                        onClick={() => setDepositWithdrawModal({ isOpen: true, type: 'WITHDRAW' })}
                        className="p-3.5 rounded-xl bg-gray-800/60 hover:bg-rose-600/20 border border-gray-700/60 hover:border-rose-500/40 text-left transition group"
                      >
                        <ArrowUpCircle className="h-5 w-5 text-rose-400 group-hover:scale-110 transition" />
                        <div className="font-semibold text-sm text-white mt-2">Withdraw Cash</div>
                        <div className="text-[11px] text-gray-400">ATM simulation</div>
                      </button>

                      <button
                        onClick={() => setTab('statement')}
                        className="p-3.5 rounded-xl bg-gray-800/60 hover:bg-cyan-600/20 border border-gray-700/60 hover:border-cyan-500/40 text-left transition group"
                      >
                        <Receipt className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition" />
                        <div className="font-semibold text-sm text-white mt-2">Bank Ledger</div>
                        <div className="text-[11px] text-gray-400">Statements & audit</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 7 Cols: Transaction History Feed */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Recent Transactions</h3>
                      <p className="text-xs text-gray-400">Account ledger sorted chronologically</p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center space-x-1.5 bg-gray-900 border border-gray-800 p-1 rounded-xl text-xs">
                      {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_SEND'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setTxFilter(f)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            txFilter === f
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {f === 'ALL' ? 'All' : f === 'TRANSFER_SEND' ? 'Transfers' : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions by reference UTR or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Transactions List */}
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredTransactions.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-gray-900/40 border border-gray-800/60 text-gray-400">
                        <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No transactions recorded yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Make a deposit or transfer to see your ledger update.</p>
                      </div>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isCredit = tx.transactionType === 'DEPOSIT' || tx.transactionType === 'TRANSFER_RECEIVE';

                        return (
                          <div
                            key={tx.id || tx.referenceNumber}
                            onClick={() => setSelectedReceipt(tx)}
                            className="p-3.5 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 hover:border-gray-700 flex items-center justify-between cursor-pointer transition group"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-xl border ${
                                  isCredit
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}
                              >
                                {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition">
                                  {tx.description || tx.transactionType}
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono mt-0.5">
                                  <span>{tx.referenceNumber}</span>
                                  <span>•</span>
                                  <span>{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-IN') : 'Recent'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`font-mono text-sm font-bold ${isCredit ? 'text-emerald-400' : 'text-gray-200'}`}>
                                {isCredit ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] font-mono text-gray-400 block">
                                Bal: ₹{Number(tx.postBalance).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onLoginSuccess={handleLoginSuccess} />

      <TransferModal
        accounts={accounts}
        activeAccount={activeAccount}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      <DepositWithdrawModal
        type={depositWithdrawModal.type}
        accounts={accounts}
        activeAccount={activeAccount}
        isOpen={depositWithdrawModal.isOpen}
        onClose={() => setDepositWithdrawModal({ isOpen: false, type: 'DEPOSIT' })}
        onSuccess={handleTransactionSuccess}
      />

      <TransactionReceiptModal
        transaction={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* New Account Modal */}
      {isNewAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F172A] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white">Open Additional Account</h3>
            <p className="text-xs text-gray-400 mt-1">Instant high-yield or current account generation</p>

            <form onSubmit={handleCreateNewAccount} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Account Category</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none"
                >
                  <option value="SAVINGS">Savings Account (4.5% p.a.)</option>
                  <option value="CURRENT">Current Account (Business)</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Initial Credit (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newAccDeposit}
                  onChange={(e) => setNewAccDeposit(e.target.value)}
                  placeholder="2000"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAccountOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
