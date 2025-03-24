import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRecentTransactions, addTransaction } from '../services/transactionService';
import TransactionForm from './TransactionForm';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!currentUser?.uid) return;
            
            setIsLoading(true);
            setError(null);
            try {
                const recentTransactions = await getRecentTransactions(currentUser.uid);
                setTransactions(recentTransactions);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('Failed to load recent transactions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [currentUser]);

    const handleTransactionSubmit = async (transactionData) => {
        if (!currentUser?.uid) return;

        setIsLoading(true);
        try {
            await addTransaction(currentUser.uid, transactionData);
            // Refresh transactions after adding
            const recentTransactions = await getRecentTransactions(currentUser.uid);
            setTransactions(recentTransactions.transactions);
        } catch (error) {
            console.error('Error adding transaction:', error);
            setError('Failed to add transaction');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Welcome to your Dashboard</h2>
            <TransactionForm 
                onSubmit={handleTransactionSubmit}
                isLoading={isLoading}
                onCancel={() => {}}
            />
            {/* ...existing code... */}
        </div>
    );
}
