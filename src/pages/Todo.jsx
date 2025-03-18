import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MdCheckCircle, MdPending, MdAssignment, MdFlag, MdRefresh } from 'react-icons/md';
import TodoList from '../components/TodoList';
import Sidebar from '../components/Sidebar';

// Add constants outside component
const DEFAULT_STATS = {
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0,
    details: { pending: 0, inProgress: 0 }
};

export default function Todo() {
    const [stats, setStats] = useState(DEFAULT_STATS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    const statsCards = useMemo(() => [
        {
            title: 'Total Tasks',
            value: stats.total,
            icon: <MdAssignment className="w-8 h-8 text-blue-500" />,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            description: 'All tasks'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: <MdCheckCircle className="w-8 h-8 text-green-500" />,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            description: 'Finished tasks'
        },
        {
            title: 'Pending & In Progress',
            value: stats.pending,
            icon: <MdPending className="w-8 h-8 text-yellow-500" />,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            description: `${stats.details.pending} pending, ${stats.details.inProgress} in progress`
        },
        {
            title: 'Urgent',
            value: stats.urgent,
            icon: <MdFlag className="w-8 h-8 text-red-500" />,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            description: 'High priority tasks'
        }
    ], [stats]);

    const fetchTodoStats = useCallback(async () => {
        if (!currentUser?.uid) return;

        setIsLoading(true);
        try {
            const q = query(
                collection(db, 'todos'),
                where('userId', '==', currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const todos = querySnapshot.docs.map(doc => doc.data());

            const statusCounts = todos.reduce((acc, todo) => {
                if (todo.completed) {
                    acc.completed++;
                } else {
                    switch (todo.status) {
                        case 'pending': acc.pending++; break;
                        case 'in-progress': acc.inProgress++; break;
                        case 'urgent': acc.urgent++; break;
                    }
                }
                return acc;
            }, { completed: 0, pending: 0, inProgress: 0, urgent: 0 });

            setStats({
                total: todos.length,
                completed: statusCounts.completed,
                pending: statusCounts.pending + statusCounts.inProgress,
                urgent: statusCounts.urgent,
                details: {
                    pending: statusCounts.pending,
                    inProgress: statusCounts.inProgress
                }
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching todo stats:', error);
            setError('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.uid]);

    useEffect(() => {
        if (currentUser) {
            fetchTodoStats();
        }
    }, [currentUser, fetchTodoStats]);

    // Add manual refresh function
    const handleRefresh = () => {
        fetchTodoStats();
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
                    ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Updated Header with sticky positioning */}
                        <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm">
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        onClick={() => setIsMobileMenuOpen(true)}
                                        aria-label="Open menu"
                                    >
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                                            Task Management
                                        </h1>
                                        <p className="text-sm text-gray-600 hidden sm:block">
                                            Track and manage your daily tasks
                                        </p>
                                    </div>
                                </div>

                                {/* Refresh Button */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className={`p-2 rounded-lg transition-all duration-200 
                                        ${isLoading
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    <MdRefresh
                                        size={24}
                                        className={`${isLoading ? 'animate-spin' : ''}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Subheader */}
                        <div className="sm:hidden -mt-2 pb-4">
                            <p className="text-sm text-gray-600">Track and manage your daily tasks</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-1">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-700"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content sections - Only render when not loading */}
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {statsCards.map((card, index) => (
                                <div
                                    key={index}
                                    className={`${card.bgColor} rounded-lg p-4 shadow-sm`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">
                                                {card.title}
                                            </p>
                                            <p className={`text-2xl font-bold ${card.textColor} mt-1`}>
                                                {isLoading ? '-' : card.value}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {card.description}
                                            </p>
                                        </div>
                                        <div className={`rounded-full p-2 bg-white shadow-sm
                                                    ${isLoading ? 'opacity-50' : ''}`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Todo List */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Tasks List</h2>
                            </div>
                            <div className="p-6">
                                <TodoList onUpdate={fetchTodoStats} autoLoad={true} />
                            </div>
                        </div>
                    </>
                </div>
            </div>
        </div>
    );
}
