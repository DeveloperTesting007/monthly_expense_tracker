import React, { useState, useEffect, useMemo } from 'react';
import { MdCheckCircle, MdPending, MdAssignment, MdFlag, MdRefresh, MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import TodoList from '../components/TodoList';
import Sidebar from '../components/Sidebar';
import { useTodo } from '../contexts/TodoContext';
import { useAuth } from '../contexts/AuthContext';
import TodoModal from '../components/TodoModal';
import TodoSummaryChart from '../components/TodoSummaryChart';

export default function Todo() {
    const { stats, isLoading, error, setError, fetchTodoStats, addTodo } = useTodo();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showStats, setShowStats] = useState(true);

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

    console.log('stats:', stats);

    const statsCards = useMemo(() => [
        {
            title: 'Pending',
            value: stats.total,
            icon: <MdAssignment className="w-8 h-8 text-yellow-500" />,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
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
            title: 'In Progress',
            value: stats.pending,
            icon: <MdPending className="w-8 h-8 text-orange-500" />,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
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

    useEffect(() => {
        if (currentUser) {
            fetchTodoStats();
        }
    }, [currentUser, fetchTodoStats]);

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
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Updated Header with collapsible description */}
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
                                        <button
                                            onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
                                            className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                                        >
                                            {isDescriptionVisible ? 'Hide description' : 'Show description'}
                                        </button>
                                        {isDescriptionVisible && (
                                            <p className="text-sm text-gray-600 mt-1 transition-all duration-300">
                                                Track and manage your daily tasks
                                            </p>
                                        )}
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

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Chart Card */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Overview</h3>
                                <TodoSummaryChart stats={stats} />
                            </div>

                            {/* Stats Grid */}
                            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
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
                                            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Todo List Section */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className={`p-2 rounded-lg transition-all duration-200 
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
                    className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 
                        inline-flex items-center justify-center p-4 rounded-full 
                        bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        focus:ring-indigo-500 transition-all duration-200
                        hover:scale-105"
                    aria-label="Add new task"
                >
                    <MdAdd className="h-6 w-6" />
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
