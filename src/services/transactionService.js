import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, where, doc, updateDoc, serverTimestamp, deleteDoc, startAfter } from 'firebase/firestore';

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
            date: new Date(transactionData.date).toISOString(), // Convert to ISO string
            amount: Number(transactionData.amount)
        };

        const docRef = await addDoc(collection(db, 'transactions'), transaction);
        return { id: docRef.id, ...transaction };
    } catch (error) {
        console.error('Add transaction error:', error);
        throw new Error('Failed to add transaction');
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
