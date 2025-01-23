import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB0Xg2bvKTY3XjD8LJM9BqHOG7kxUJ1V0Y",
    authDomain: "monthly-expense-tracker-2e8e6.firebaseapp.com",
    projectId: "monthly-expense-tracker-2e8e6",
    storageBucket: "monthly-expense-tracker-2e8e6.firebasestorage.app",
    messagingSenderId: "738019185076",
    appId: "1:738019185076:web:58657ae54775186ce6a2e1",
    measurementId: "G-73V7D70Y2F"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
