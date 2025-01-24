import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, where, doc, updateDoc, serverTimestamp, deleteDoc, startAfter, Timestamp } from 'firebase/firestore';
import { getCategories } from './categoryService';

export const addTransaction = async (userId, transactionData) => {
    if (!userId) throw new Error('User ID is required');

    try {
        // Verify that the category exists
        const categories = await getCategories(userId, transactionData.type);
        const categoryExists = categories.some(cat => cat.id === transactionData.categoryId);
        
        if (!categoryExists) {
            throw new Error('Invalid category');
        }

        const transaction = {
            ...transactionData,
            userId,
            createdAt: Date.now(),
            date: new Date(transactionData.date).toISOString(),
            amount: Number(transactionData.amount)
        };

        const docRef = await addDoc(collection(db, 'transactions'), transaction);
        return { id: docRef.id, ...transaction };
    } catch (error) {
        console.error('Add transaction error:', error);
        throw new Error('Failed to add transaction: ' + error.message);
    }
};

export const getRecentTransactions = async (userId, lastDoc = null, pageSize = 10) => {
    if (!userId) throw new Error('User ID is required');

    try {
        let queryRef = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (lastDoc) {
            queryRef = query(
                collection(db, 'transactions'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(pageSize)
            );
        }

        const snapshot = await getDocs(queryRef);
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        
        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            amount: Number(doc.data().amount)
        }));

        return {
            transactions,
            lastDoc: lastVisible,
            hasMore: snapshot.docs.length === pageSize
        };
    } catch (error) {
        console.error('Recent transactions error:', error);
        throw new Error('Failed to fetch recent transactions');
    }
};

export const getAllTransactions = async (userId, dateRange = 'all') => {
    if (!userId) throw new Error('User ID is required');

    try {
        let q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        // Add date range filter if specified
        if (dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    break;
            }

            if (dateRange !== 'all') {
                q = query(
                    collection(db, 'transactions'),
                    where('userId', '==', userId),
                    where('date', '>=', startDate.toISOString()),
                    orderBy('date', 'desc')
                );
            }
        }

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            amount: Number(doc.data().amount || 0), // Ensure amount is a number
            date: doc.data().date // Ensure date is included
        }));

        return { transactions }; // Return in expected format
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        throw new Error('Failed to fetch transactions: ' + error.message);
    }
};

const calculateTransactionSummary = (transactions) => {
    return transactions.reduce((summary, transaction) => {
        const amount = Number(transaction.amount);
        
        if (transaction.type === 'income') {
            summary.totalIncome += amount;
        } else if (transaction.type === 'expense') {
            summary.totalExpenses += amount;
        }

        summary.netBalance = summary.totalIncome - summary.totalExpenses;
        return summary;
    }, {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0
    });
};

const calculateCategoryBreakdown = (transactions) => {
    const breakdown = {
        income: {},
        expense: {}
    };

    transactions.forEach(transaction => {
        const type = transaction.type;
        const category = transaction.category;
        const amount = Number(transaction.amount);

        if (!breakdown[type][category]) {
            breakdown[type][category] = 0;
        }
        breakdown[type][category] += amount;
    });

    return breakdown;
};

const calculateMonthlyTrends = (transactions) => {
    const trends = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!trends[monthKey]) {
            trends[monthKey] = {
                income: 0,
                expenses: 0,
                netBalance: 0
            };
        }

        const amount = Number(transaction.amount);
        if (transaction.type === 'income') {
            trends[monthKey].income += amount;
        } else if (transaction.type === 'expense') {
            trends[monthKey].expenses += amount;
        }
        
        trends[monthKey].netBalance = trends[monthKey].income - trends[monthKey].expenses;
    });

    // Sort by month
    return Object.fromEntries(
        Object.entries(trends)
            .sort(([a], [b]) => b.localeCompare(a))
    );
};

// Helper function to format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Helper function to get percentage
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
};

export const updateTransaction = async (userId, transactionId, updatedData) => {
    if (!userId) throw new Error('User ID is required');
    if (!transactionId) throw new Error('Transaction ID is required');

    try {
        const transactionRef = doc(db, 'transactions', transactionId);
        
        // Add timestamp and ensure amount is a number
        const dataToUpdate = {
            ...updatedData,
            updatedAt: serverTimestamp(),
            amount: Number(updatedData.amount),
            date: new Date(updatedData.date).toISOString(), // Convert to ISO string
            userId // Ensure userId is included in the update
        };

        await updateDoc(transactionRef, dataToUpdate);
        return { id: transactionId, ...dataToUpdate };
    } catch (error) {
        console.error('Update transaction error:', error);
        throw new Error('Failed to update transaction: ' + error.message);
    }
};

export const deleteTransaction = async (transactionId) => {
    if (!transactionId) throw new Error('Transaction ID is required');

    try {
        await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (error) {
        console.error('Delete transaction error:', error);
        throw new Error('Failed to delete transaction: ' + error.message);
    }
};
