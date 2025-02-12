import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRecentTransactions } from '../services/transactionService';

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
}
