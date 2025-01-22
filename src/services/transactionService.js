import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export const categories = {
    expense: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Healthcare',
        'Utilities',
        'Rent',
        'Education',
        'Travel',
        'Other'
    ],
    income: [
        'Salary',
        'Freelance',
        'Investments',
        'Rental Income',
        'Business',
        'Gift',
        'Other'
    ]
};

export const addTransaction = async (userId, transactionData) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const transaction = {
            ...transactionData,
            userId,
            createdAt: Date.now(),
            date: transactionData.date,
            amount: Number(transactionData.amount)
        };

        const docRef = await addDoc(collection(db, 'transactions'), transaction);
        return { id: docRef.id, ...transaction };
    } catch (error) {
        console.error('Add transaction error:', error);
        throw new Error('Failed to add transaction');
    }
};

export const getRecentTransactions = async (userId) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            amount: Number(doc.data().amount)
        }));
    } catch (error) {
        console.error('Recent transactions error:', error);
        throw new Error('Failed to fetch recent transactions');
    }
};

export const getAllTransactions = async (userId) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            amount: Number(doc.data().amount),
            date: Number(doc.data().date)
        }));
    } catch (error) {
        console.error('All transactions error:', error);
        throw new Error('Failed to fetch all transactions');
    }
};
