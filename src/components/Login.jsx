import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserCircleIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import GoogleButton from './GoogleButton';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');  // Changed from '/' to '/dashboard'
        } catch (err) {
            // Error is handled in AuthContext
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            navigate('/dashboard');  // Changed from '/' to '/dashboard'
        } catch (err) {
            // Error handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            {loading && <LoadingSpinner size="lg" overlay={true} />}
            
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center">
                    <UserCircleIcon className="mx-auto h-12 w-12 text-indigo-600" />
                    <h2 className="mt-4 text-3xl font-bold text-gray-900 mb-6">
                        Sign in to your account
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            <span className="flex items-center">
                                {loading && <LoadingSpinner size="sm" />}
                                <span className={loading ? "ml-2" : ""}>
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </span>
                            </span>
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/signup"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Don't have an account? Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
