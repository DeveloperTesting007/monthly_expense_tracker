import React, { useState, useEffect, useMemo } from 'react';
import { MdCheckCircle, MdPending, MdAssignment, MdFlag, MdRefresh, MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import TodoList from '../components/TodoList';
import Sidebar from '../components/Sidebar';
import { useTodo } from '../contexts/TodoContext';
import { useAuth } from '../contexts/AuthContext';
import TodoModal from '../components/TodoModal';
import TodoSummaryChart from '../components/TodoSummaryChart';

export default function Todo() {
    const { stats, isLoading, setError, fetchTodoStats, addTodo } = useTodo();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showMobileStats, setShowMobileStats] = useState(false);

    const handleModalSubmit = async (formData) => {
        try {
            await addTodo(formData);
            setShowModal(false);
            await fetchTodoStats();
        } catch (error) {
            console.error('Failed to create task:', error);
            setError('Failed to create task');
        }
    };

    const statsCards = useMemo(() => [
        {
            title: 'Pending',
            value: stats.details.pending,
            icon: <MdAssignment className="w-8 h-8 text-yellow-500" />,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: <MdCheckCircle className="w-8 h-8 text-green-500" />,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'In Progress',
            value: stats.details.inProgress,
            icon: <MdPending className="w-8 h-8 text-blue-500" />,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Urgent',
            value: stats.urgent,
            icon: <MdFlag className="w-8 h-8 text-red-500" />,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600'
        }
    ], [stats]);

    useEffect(() => {
        if (currentUser) {
            fetchTodoStats();
        }
    }, [currentUser, fetchTodoStats]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setShowMobileStats(true);
            } else {
                setShowMobileStats(false);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/30">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Updated Header with collapsible description */}
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onClick={() => setIsMobileMenuOpen(true)}
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                            Task Management
                                        </h1>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className={`p-2.5 rounded-xl transition-all duration-200 
                                        ${isLoading
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105'}`}
                                >
                                    <MdRefresh size={22} className={`${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                     
                                <p className="text-sm text-gray-600 mt-2 pl-16 lg:pl-0 animate-fadeIn">
                                    Track and manage your daily tasks efficiently
                                </p>
                           
                        

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                            {/* Chart Card */}
                            <div className="lg:col-span-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Overview</h3>
                                <TodoSummaryChart stats={stats} />
                            </div>

                            {/* Stats Grid */}
                            <div className="lg:col-span-1">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                                    <button
                                        onClick={() => setShowMobileStats(!showMobileStats)}
                                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        aria-label={showMobileStats ? 'Hide stats' : 'Show stats'}
                                    >
                                        {showMobileStats ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                                    </button>
                                </div>
                                <div className={`grid grid-cols-2 gap-4 transition-all duration-300
                                    ${!showMobileStats ? 'hidden lg:grid' : ''}`}>
                                    {statsCards.map((card, index) => (
                                        <div
                                            key={index}
                                            className={`${card.bgColor} rounded-xl p-6 flex flex-col justify-between`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-lg ${card.iconBg || 'bg-white/90'}`}>
                                                    {card.icon}
                                                </div>
                                                <span className={`text-3xl font-bold ${card.textColor}`}>
                                                    {isLoading ? '-' : card.value}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-gray-700 font-medium">{card.title}</h3>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </div>

                        {/* Todo List Section */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className={`p-2.5 rounded-xl transition-all duration-200 
                                        ${isLoading ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                                >
                                    <MdRefresh
                                        size={20}
                                        className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`}
                                    />
                                </button>
                            </div>
                            <div className="p-6">
                                <TodoList onUpdate={fetchTodoStats} autoLoad={true} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="fixed right-6 bottom-6 z-40 
                        inline-flex items-center justify-center w-14 h-14 rounded-full
                        bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                        shadow-lg hover:shadow-indigo-500/25
                        hover:from-indigo-500 hover:to-purple-500
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        focus:ring-indigo-500 transition-all duration-200
                        hover:scale-110 hover:rotate-90
                        animate-pulse hover:animate-none"
                    aria-label="Add new task"
                >
                    <MdAdd className="h-7 w-7" />
                </button>

            </div>

            {/* Modal */}
            <TodoModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                initialData={null}
            />
        </div>
    );
}
