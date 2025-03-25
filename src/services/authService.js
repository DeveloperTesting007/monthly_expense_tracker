import { db } from '../config/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';

const auth = getAuth();

export const signup = async (email, password, userData) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        await updateProfile(result.user, {
            displayName: userData.name
        });

        await setDoc(doc(db, 'users', result.user.uid), {
            name: userData.name,
            email: email,
            phone: userData.phone,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });

        return result;
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: serverTimestamp()
    });
    return result;
};

export const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const userData = {
        name: result.user.displayName || '',
        email: result.user.email || '',
        phone: result.user.phoneNumber || '',
        photoURL: result.user.photoURL || '',
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', result.user.uid), {
        ...userData,
        createdAt: serverTimestamp()
    }, { merge: true });

    return result;
};

export const updateUserProfile = async (user, userData) => {
    await updateProfile(user, {
        displayName: userData.name,
        photoURL: userData.photoURL
    });

    await updateDoc(doc(db, 'users', user.uid), {
        ...userData,
        updatedAt: serverTimestamp()
    });
};

export const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
    return signOut(auth);
};
