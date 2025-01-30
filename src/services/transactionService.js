import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, where, doc, updateDoc, serverTimestamp, deleteDoc, startAfter, Timestamp } from 'firebase/firestore';
import { getCategories } from './categoryService';

// Add helper function for category mapping
const createCategoryMap = (categoriesData) => {
    const categoryMap = {};
    Object.values(categoriesData).forEach(typeCategories => {
        typeCategories.forEach(category => {
            categoryMap[category.id] = {
                name: category.name,
                type: category.type
            };
        });
    });
    return categoryMap;
};

export const addTransaction = async (userId, transactionData) => {
    if (!userId) throw new Error('User ID is required');

    try {
        // Verify that the category exists
        const categories = await getCategories();
        const category = categories[transactionData.type].find(c => c.id === transactionData.categoryId);
        
        if (!category) {
            throw new Error('Invalid category');
        }

        const transaction = {
            ...transactionData,
            userId,
            categoryName: category.name, // Store both ID and name
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
        // First, fetch all categories to create a lookup map
        const categoriesData = await getCategories();
        const categoryMap = createCategoryMap(categoriesData);

        // Fetch transactions
        let queryRef = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (lastDoc) {
            queryRef = query(queryRef, startAfter(lastDoc));
        }

        const snapshot = await getDocs(queryRef);
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        
        // Map transactions with proper category information
        const transactions = snapshot.docs.map(doc => {
            const data = doc.data();
            const category = categoryMap[data.categoryId];
            
            return {
                id: doc.id,
                ...data,
                amount: Number(data.amount),
                categoryName: category ? category.name : (data.categoryName || 'Unknown Category')
            };
        });

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
        // First fetch categories for lookup
        const categoriesData = await getCategories();
        const categoryMap = createCategoryMap(categoriesData);

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
        const transactions = snapshot.docs.map(doc => {
            const data = doc.data();
            const category = categoryMap[data.categoryId];
            
            return {
                id: doc.id,
                ...data,
                amount: Number(data.amount || 0),
                categoryName: category ? category.name : (data.categoryName || 'Unknown Category'),
                date: data.date
            };
        });

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

// Update category breakdown calculation
const calculateCategoryBreakdown = (transactions) => {
    const breakdown = {
        income: {},
        expense: {}
    };

    transactions.forEach(transaction => {
        const type = transaction.type;
        const categoryName = transaction.categoryName || 'Unknown Category';
        const amount = Number(transaction.amount);

        if (!breakdown[type][categoryName]) {
            breakdown[type][categoryName] = 0;
        }
        breakdown[type][categoryName] += amount;
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
