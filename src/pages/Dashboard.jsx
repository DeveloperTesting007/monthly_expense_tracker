import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import RecentTransactions from '../components/RecentTransactions';
import SummaryCards from '../components/SummaryCards';
import { addTransaction, getRecentTransactions } from '../services/transactionService';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);  // Initialize as empty array
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [sortBy, setSortBy] = useState('date'); // date, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const itemsPerPage = 5;
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isRecentTransactionsOpen, setIsRecentTransactionsOpen] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Update fetchTransactions to ensure array handling
  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      setError(null);
      const result = await getRecentTransactions(currentUser.uid);
      // Ensure we're setting an array
      setTransactions(Array.isArray(result.transactions) ? result.transactions : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
      setTransactions([]); // Set empty array on error
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleAddTransaction = async (transaction) => {
    setIsLoading(true);
    try {
      await addTransaction(currentUser.uid, transaction);
      await fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  // Safe array operations with type checking
  const filteredTransactions = Array.isArray(transactions) 
    ? transactions.filter(transaction => {
        if (filter === 'all') return true;
        return transaction.type === filter;
      })
    : [];

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });

  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Mobile Header with Menu Button */}
            <div className="flex justify-between items-center mb-6">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex-1 ml-4 lg:ml-0">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Welcome Back!</h1>
                <p className="text-sm lg:text-base text-gray-600">Here's your financial overview</p>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 lg:px-4 lg:py-2 bg-red-600 text-white text-sm lg:text-base 
                  rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>

            {/* Summary Cards */}
            <div className="mb-6">
              <SummaryCards transactions={transactions} />
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {error && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-1">
                      <p className="text-sm text-yellow-700">{error}</p>
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="text-yellow-700"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Action Button */}
              {!isTransactionFormOpen && (
                <button
                  onClick={() => setIsTransactionFormOpen(true)}
                  className="fixed right-4 bottom-4 lg:right-8 lg:bottom-8 z-10 
                    bg-blue-600 hover:bg-blue-700 text-white
                    rounded-full p-4 shadow-lg transition-all duration-200
                    flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Add Transaction</span>
                </button>
              )}

              {/* Collapsible Transaction Form */}
              <div className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-300 ${
                isTransactionFormOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4 hidden'
              }`}>
                <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Add Transaction</h2>
                  <button
                    onClick={() => setIsTransactionFormOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} />
                </div>
              </div>

              {/* Collapsible Recent Transactions */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <button
                  onClick={() => setIsRecentTransactionsOpen(prev => !prev)}
                  className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200 hover:bg-gray-50"
                >
                  <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      isRecentTransactionsOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isRecentTransactionsOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="p-4">
                    {/* Transaction Controls */}
                    <div className="flex flex-wrap gap-4 items-center mb-4">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-lg border-gray-300 text-sm"
                      >
                        <option value="all">All Transactions</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expenses Only</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-lg border-gray-300 text-sm"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                      </select>

                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>

                    <RecentTransactions 
                      transactions={paginatedTransactions} 
                      isLoading={isLoadingTransactions}
                    />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded-lg bg-gray-100 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 rounded-lg bg-gray-100 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
