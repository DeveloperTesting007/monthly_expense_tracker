import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import RecentTransactions from '../components/RecentTransactions';
import SummaryCards from '../components/SummaryCards';
import { addTransaction, getRecentTransactions } from '../services/transactionService';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  const fetchTransactions = async () => {
    try {
      const recentTransactions = await getRecentTransactions(currentUser.uid);
      setTransactions(recentTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto"> {/* Changed from max-w-7xl to max-w-3xl */}
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
              <p className="text-gray-600">Here's your financial overview</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                transition-colors duration-200 flex items-center gap-2"
            >
              <span>Logout</span>
            </button>
          </div>

          {/* Summary Cards */}
          <SummaryCards transactions={transactions} />

          {/* Main Content - Single Column */}
          <div className="space-y-8">
            <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} />
            <RecentTransactions transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
