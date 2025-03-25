import { auth, db } from '../config/firebase';
import { 
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CategoryService } from './categoryService';

export class AuthError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

export const errorMessages = {
    'auth/email-already-in-use': 'An account already exists with this email',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/popup-closed-by-user': 'Sign in cancelled',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'default': 'An error occurred'
};

export class AuthService {
    static async createUserDocument(user, additionalData = {}) {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const userData = {
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName || additionalData.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            settings: {
                currency: 'USD',
                language: 'en',
                theme: 'light'
            },
            ...additionalData
        };

        try {
            await setDoc(userRef, userData, { merge: true });
            return userData;
        } catch (error) {
            console.error('Error creating user document:', error);
            throw new AuthError('firestore/user-doc-creation-failed', 'Failed to create user profile');
        }
    }

    static async signUp(email, password, userData = {}) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Firebase Auth profile if displayName provided
            if (userData.displayName) {
                await updateProfile(user, { 
                    displayName: userData.displayName 
                });
            }

            // Create user document in Firestore
            await this.createUserDocument(user, userData);

            // Create monthly_tracker document for the user
            const monthlyTrackerRef = doc(db, 'monthly_tracker', user.uid);
            await setDoc(monthlyTrackerRef, {
                userId: user.uid,
                createdAt: serverTimestamp(),
                settings: {
                    defaultView: 'monthly',
                    startDayOfMonth: 1,
                    notificationsEnabled: true
                }
            });

            // Create default categories
            await CategoryService.createDefaultCategories(user.uid);

            return {
                user,
                message: 'Account created successfully!'
            };
        } catch (error) {
            console.error('Signup error:', error);
            throw new AuthError(error.code, errorMessages[error.code] || errorMessages.default);
        }
    }

    static async login(email, password) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw new AuthError(error.code, errorMessages[error.code] || errorMessages.default);
        }
    }

    static async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Create/Update user document for Google Sign-in
            await this.createUserDocument(result.user);
            
            return {
                user: result.user,
                message: 'Signed in with Google successfully!'
            };
        } catch (error) {
            throw new AuthError(error.code, errorMessages[error.code] || errorMessages.default);
        }
    }

    static async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new AuthError(error.code, 'Failed to sign out');
        }
    }

    static async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw new AuthError(error.code, errorMessages[error.code] || errorMessages.default);
        }
    }

    static async updateUserProfile(user, userData) {
        try {
            await updateProfile(user, userData);
        } catch (error) {
            throw new AuthError(error.code, 'Failed to update profile');
        }
    }

    static async checkTokenExpiration(user) {
        const token = await user.getIdTokenResult();
        const expirationTime = new Date(token.expirationTime).getTime();
        const now = new Date().getTime();
        return expirationTime <= now;
    }
}
