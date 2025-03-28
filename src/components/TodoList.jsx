import React, { useState, useEffect, useMemo } from 'react';
import { 
    MdCheckCircle, MdRadioButtonUnchecked, MdEdit, 
    MdDelete, MdAccessTime, MdMoreVert, MdVisibility,
    MdSort, MdArrowUpward, MdArrowDownward, MdSearch,
    MdOutlineCalendarToday 
} from 'react-icons/md';
import { useTodo } from '../contexts/TodoContext';
import TodoModal from './TodoModal';
import TodoDetailModal from './TodoDetailModal';

export default function TodoList({ onUpdate, autoLoad = false }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [previousStatus, setPreviousStatus] = useState({});
    const { todos, isLoading, fetchTodos, updateTodo, deleteTodo } = useTodo();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'status',
        direction: 'asc'
    });

    useEffect(() => {
        if (autoLoad) {
            fetchTodos();
        }
    }, [fetchTodos, autoLoad]);

    const handleEdit = (todo) => {
        setSelectedTodo(todo);
        setIsEditModalOpen(true);
    };

    const handleViewDetail = (todo) => {
        setSelectedTodo(todo);
        setIsDetailModalOpen(true);
    };

    const handleUpdate = async (formData) => {
        try {
            if (selectedTodo) {
                await updateTodo(selectedTodo.id, formData);
            }
            setIsEditModalOpen(false);
            setSelectedTodo(null);
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const handleDelete = async (todoId) => {
        try {
            await deleteTodo(todoId);
        } catch (err) {
            console.error('Failed to delete todo:', err);
        }
    };

    const handleStatusToggle = async (todo) => {
        try {
            if (todo.status === 'completed') {
                // Revert to previous status or default to 'pending'
                const newStatus = previousStatus[todo.id] || 'pending';
                await updateTodo(todo.id, { status: newStatus });
            } else {
                // Save current status before completing
                setPreviousStatus(prev => ({
                    ...prev,
                    [todo.id]: todo.status
                }));
                await updateTodo(todo.id, { status: 'completed' });
            }
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleSort = () => {
        setSortConfig(prev => ({
            key: 'status',
            direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getStatusPriority = (status) => {
        const priorities = {
            'urgent': 1,
            'pending': 2,
            'in-progress': 3,
            'completed': 4
        };
        return priorities[status] || 999;
    };

    const filteredAndSortedTodos = useMemo(() => {
        if (!todos) return [];
        
        return [...todos]
            .filter(todo => 
                todo.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
                // First sort by status priority
                const statusCompare = getStatusPriority(a.status) - getStatusPriority(b.status);
                if (statusCompare !== 0) return statusCompare;
                
                // Then sort by creation date (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    }, [todos, searchQuery]);

    const getStatusColor = (status) => {
        const colors = {
            urgent: 'bg-red-100 text-red-700',
            pending: 'bg-yellow-100 text-yellow-700',
            'in-progress': 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700'
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        return status === 'completed' 
            ? <MdCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            : <MdRadioButtonUnchecked className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />;
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-2 sm:space-y-4">
            {/* Search and Sort Controls */}
            <div className="flex items-center justify-between gap-4 pb-4">
                <div className="relative flex-1 max-w-md group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 
                        group-focus-within:text-indigo-500 transition-colors duration-200" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 
                            focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                            transition-all duration-200"
                    />
                </div>
                <button
                    onClick={handleSort}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                        transition-all duration-200
                        ${sortConfig.direction === 'asc' 
                            ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    Sort by Status
                    {sortConfig.direction === 'asc' 
                        ? <MdArrowUpward className="h-4 w-4" />
                        : <MdArrowDownward className="h-4 w-4" />}
                </button>
            </div>

            {/* Task List */}
            <div className="divide-y divide-gray-100">
                {filteredAndSortedTodos.map((todo) => (
                    <div
                        key={todo._id}
                        className="group flex items-start sm:items-center gap-4 py-4
                            hover:bg-gray-50/80 transition-colors duration-200 rounded-xl px-4"
                    >
                        <button
                            onClick={() => handleStatusToggle(todo)}
                            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            title="Click to change status"
                        >
                            {getStatusIcon(todo.status)}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className={`text-sm font-medium truncate
                                    ${todo.status === 'completed' 
                                        ? 'text-gray-500 line-through' 
                                        : 'text-gray-900'}`}>
                                    {todo.title}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                                    text-xs font-medium ${getStatusColor(todo.status)}`}>
                                    {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                                </span>
                            </div>
                            {/* Dates */}
                            <div className="mt-1 flex items-center gap-3 text-[11px] sm:text-xs text-gray-500">
                                <span className="inline-flex items-center">
                                    <MdOutlineCalendarToday className="mr-0.5 h-3 w-3" />
                                    Created {new Date(todo.createdAt).toLocaleDateString()}
                                </span>
                                {todo.dueDate && (
                                    <span className="inline-flex items-center">
                                        <MdAccessTime className="mr-0.5 h-3 w-3" />
                                        Due {new Date(todo.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 
                            transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
                            <button
                                onClick={() => handleViewDetail(todo)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 
                                    hover:bg-blue-50 rounded-lg transition-all duration-200"
                            >
                                <MdVisibility className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleEdit(todo)}
                                className="p-1.5 text-gray-400 hover:text-indigo-500 
                                    hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            >
                                <MdEdit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(todo._id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 
                                    hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                <MdDelete className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <TodoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdate}
                initialData={selectedTodo}
            />
            <TodoDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedTodo(null);
                }}
                todo={selectedTodo}
            />
        </div>
    );
}
