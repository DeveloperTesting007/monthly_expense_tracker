import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

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
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      userId,
      createdAt: Date.now(),
      date: transactionData.date, // Store the timestamp directly
    });
    
    return { 
      id: docRef.id, 
      ...transactionData,
      createdAt: Date.now(),
    };
  } catch (error) {
    throw new Error('Error adding transaction: ' + error.message);
  }
};

export const getRecentTransactions = async (userId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Don't convert to Date object here, just return raw data
      return {
        id: doc.id,
        ...data,
      };
    });
  } catch (error) {
    throw new Error('Error fetching transactions: ' + error.message);
  }
};
