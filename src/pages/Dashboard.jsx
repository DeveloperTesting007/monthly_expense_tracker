import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import RecentTransactions from '../components/RecentTransactions';
import SummaryCards from '../components/SummaryCards';
import { addTransaction, getRecentTransactions, getAllTransactions } from '../services/transactionService';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);  // Initialize as empty array
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isRecentTransactionsOpen, setIsRecentTransactionsOpen] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [isLoadingAllTransactions, setIsLoadingAllTransactions] = useState(true);

  useEffect(() => {
    fetchAllData();
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

  const fetchAllData = async () => {
    setIsLoadingTransactions(true);
    setIsLoadingAllTransactions(true);
    try {
      setError(null);
      // Fetch recent transactions for display
      const recentResult = await getRecentTransactions(currentUser.uid);
      setTransactions(Array.isArray(recentResult.transactions) ? recentResult.transactions : []);
      
      // Fetch all transactions for calculations
      const allResult = await getAllTransactions(currentUser.uid);
      setAllTransactions(Array.isArray(allResult.transactions) ? allResult.transactions : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
      setTransactions([]);
      setAllTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
      setIsLoadingAllTransactions(false);
    }
  };

  const handleAddTransaction = async (transaction) => {
    setIsLoading(true);
    try {
      await addTransaction(currentUser.uid, transaction);
      await fetchAllData(); // Update both recent and all transactions
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

  // Updated filtering and sorting logic
  const filteredAndSortedTransactions = React.useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    return [...transactions]
      .filter(transaction => {
        // Type filter
        if (filters.type !== 'all' && transaction.type !== filters.type) return false;
        
        // Search filter
        if (filters.searchQuery && !transaction.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
          return false;
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
          const transactionDate = new Date(transaction.date);
          const today = new Date();
          const diffTime = Math.abs(today - transactionDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          switch (filters.dateRange) {
            case 'today':
              return diffDays <= 1;
            case 'week':
              return diffDays <= 7;
            case 'month':
              return diffDays <= 30;
            default:
              return true;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const direction = filters.sortOrder === 'desc' ? 1 : -1;
        
        if (filters.sortBy === 'date') {
          return (new Date(b.date) - new Date(a.date)) * direction;
        }
        return (b.amount - a.amount) * direction;
      });
  }, [transactions, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content - Updated max width and padding */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto"> {/* Changed from max-w-3xl to max-w-6xl */}
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-8"> {/* Increased margin bottom */}
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
            </div>

            {/* Summary Cards - Updated grid for larger screens */}
            <div className="mb-8">
              <SummaryCards 
                transactions={allTransactions} 
                isLoading={isLoadingAllTransactions}
              />
            </div>

            {/* Main Content Area */}
            <div className="space-y-8"> {/* Increased gap between sections */}
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
                  {/* <span className="hidden sm:inline">Add New Transaction</span> */}
                </button>
              )}

              {/* Transaction Form Card - Wider padding on larger screens */}
              <div className={`bg-white rounded-xl shadow-sm overflow-hidden 
                             transition-all duration-300 ${isTransactionFormOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
              >
                <div className="px-6 py-4 lg:px-8 flex justify-between items-center border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Add New Transaction</h2>
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
                <div className="p-6 lg:p-8">
                  <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} />
                </div>
              </div>

              {/* Recent Transactions Card - Wider padding on larger screens */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 lg:px-8 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={filters.searchQuery}
                          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                          className="w-48 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                        />
                        <svg className="absolute right-2 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>

                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>

                      <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                        <button
                          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                          title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                          <svg className={`w-4 h-4 transform transition-transform ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Filters */}
                  <div className={`sm:hidden mt-3 space-y-3 ${showFilters ? 'block' : 'hidden'}`}>
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 
                                 text-base placeholder:text-gray-400
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 
                                 bg-white text-base"
                      >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>

                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 
                                 bg-white text-base"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center justify-between py-2 mt-2">
                      <span className="text-sm text-gray-600">Sort by:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleFilterChange('sortBy', 'date')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium
                            ${filters.sortBy === 'date' 
                              ? 'bg-indigo-50 text-indigo-600' 
                              : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          Date
                        </button>
                        <button
                          onClick={() => handleFilterChange('sortBy', 'amount')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium
                            ${filters.sortBy === 'amount' 
                              ? 'bg-indigo-50 text-indigo-600' 
                              : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          Amount
                        </button>
                        <button
                          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <svg className={`w-5 h-5 transform transition-transform ${
                            filters.sortOrder === 'desc' ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {(filters.type !== 'all' || filters.dateRange !== 'all' || filters.searchQuery) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        {filters.type !== 'all' && (
                          <span className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                            {filters.type}
                          </span>
                        )}
                        {filters.dateRange !== 'all' && (
                          <span className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                            {filters.dateRange}
                          </span>
                        )}
                        {filters.searchQuery && (
                          <span className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                            Search: {filters.searchQuery}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <RecentTransactions
                    transactions={paginatedTransactions}
                    isLoading={isLoadingTransactions}
                  />
                </div>
                {/* ...existing pagination... */}
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

              {/* ...rest of existing code... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
