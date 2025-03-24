import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const signup = async (email, password, profileData) => {
    const auth = getAuth();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save profile data to Firestore using user ID as the document ID
        const userProfile = {
            ...profileData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, `monthly_tracker/${user.uid}`), { profile: userProfile });

        return user;
    } catch (error) {
        console.error('Signup error:', error);
        throw new Error('Failed to sign up: ' + error.message);
    }
};

export const signupWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Save profile data to Firestore using user ID as the document ID
        const userProfile = {
            name: user.displayName,
            email: user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, `monthly_tracker/${user.uid}`), { profile: userProfile });

        return user;
    } catch (error) {
        console.error('Google signup error:', error);
        throw new Error('Failed to sign up with Google: ' + error.message);
    }
};
