import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import {
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useMessage } from './MessageProvider';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showMessage } = useMessage();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password, userData) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update user profile with display name
            await updateProfile(result.user, {
                displayName: userData.name
            });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                name: userData.name,
                email: email,
                phone: userData.phone,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });

            showMessage('Account created successfully!', 'success');
            return result;
        } catch (error) {
            const message =
                error.code === 'auth/email-already-in-use' ? 'An account already exists with this email' :
                    error.code === 'auth/invalid-email' ? 'Invalid email address' :
                        'Failed to create account';
            showMessage(message, 'error');
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            showMessage('Signed in successfully!', 'success');
            return result;
        } catch (error) {
            const message =
                error.code === 'auth/user-not-found' ? 'No account found with this email' :
                    error.code === 'auth/wrong-password' ? 'Incorrect password' :
                        'Failed to sign in';
            showMessage(message, 'error');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            showMessage('Signed out successfully', 'success');
        } catch (error) {
            showMessage('Failed to sign out', 'error');
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());

            // Prepare user data
            const userData = {
                name: result.user.displayName || '',
                email: result.user.email || '',
                phone: result.user.phoneNumber || '',
                photoURL: result.user.photoURL || '',
                lastLogin: serverTimestamp()
            };

            // Only add createdAt if it's a new user
            const userDocRef = doc(db, 'users', result.user.uid);
            try {
                await setDoc(userDocRef, {
                    ...userData,
                    createdAt: serverTimestamp()
                }, { merge: true });
            } catch (firestoreError) {
                console.error('Firestore error:', firestoreError);
                showMessage('Error updating user profile', 'error');
                // Continue execution as auth was successful
            }

            showMessage('Signed in with Google successfully!', 'success');
            return result;
        } catch (error) {
            const message =
                error.code === 'auth/popup-closed-by-user' ? 'Sign in cancelled' :
                error.code === 'auth/network-request-failed' ? 'Network error. Please check your connection.' :
                'Failed to sign in with Google';
            showMessage(message, 'error');
            throw error;
        }
    };

    const value = {
        currentUser,
        signup,
        login,
        logout,
        loading,
        signInWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
