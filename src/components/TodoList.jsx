import React, { useEffect, useState } from 'react';
import { useTodo } from '../contexts/TodoContext';
import { MdHistory, MdEdit, MdDelete, MdPriorityHigh, MdAccessTime } from 'react-icons/md';
import TodoModal from './TodoModal';

export default function TodoList() {
    const { 
        todos, 
        isLoading, 
        error, 
        fetchTodos, 
        addTodo, 
        updateTodo, 
        deleteTodo 
    } = useTodo();
    const [newTodoText, setNewTodoText] = useState('');
    const [showHistory, setShowHistory] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState(null);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const handleOpenModal = (todo = null) => {
        setSelectedTodo(todo);
        setModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedTodo) {
                await updateTodo(selectedTodo.id, formData);
            } else {
                await addTodo(formData);
            }
            setModalOpen(false);
            setSelectedTodo(null);
        } catch (err) {
            console.error('Failed to save todo:', err);
        }
    };

    const handleStatusChange = async (todoId, newStatus) => {
        try {
            await updateTodo(todoId, { status: newStatus });
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const handlePriorityChange = async (todoId, newPriority) => {
        try {
            await updateTodo(todoId, { priority: parseInt(newPriority) });
        } catch (err) {
            console.error('Failed to update priority:', err);
        }
    };

    const handleDelete = async (todoId) => {
        try {
            await deleteTodo(todoId);
        } catch (err) {
            console.error('Failed to delete todo:', err);
        }
    };

    const getPriorityLabel = (priority) => {
        const labels = ['Low', 'Medium', 'High'];
        const colors = ['text-gray-500 bg-gray-100', 'text-yellow-600 bg-yellow-100', 'text-red-600 bg-red-100'];
        return {
            label: labels[priority] || 'Low',
            className: colors[priority] || colors[0]
        };
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-orange-100 text-orange-800',
            'urgent': 'bg-red-100 text-red-800',
            'completed': 'bg-green-100 text-green-800'
        };
        return colors[status] || colors.pending;
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-4">
            {/* Remove the old Add Task button from header */}
            {/* <div className="sticky top-0 z-10 bg-white px-4 py-3 sm:px-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
            </div> */}

            {/* Tasks List */}
            <div className="divide-y divide-gray-200">
                {todos.map((todo) => (
                    <div key={todo.id} className="bg-white">
                        <div className="px-4 py-4 sm:px-6">
                            {/* Task Header */}
                            <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${getPriorityLabel(todo.priority).className}`}>
                                            <MdPriorityHigh className="mr-1" />
                                            {getPriorityLabel(todo.priority).label}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${getStatusColor(todo.status)}`}>
                                            {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {todo.title}
                                    </h3>
                                </div>
                                
                                {/* Mobile Action Buttons */}
                                <div className="flex shrink-0 ml-2">
                                    <button onClick={() => handleOpenModal(todo)}
                                        className="p-1 text-gray-500 hover:text-gray-700">
                                        <MdEdit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(todo.id)}
                                        className="p-1 text-red-500 hover:text-red-700">
                                        <MdDelete size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Task Details */}
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                    {todo.dueDate && (
                                        <div className="flex items-center">
                                            <MdAccessTime className="mr-1.5 h-4 w-4 shrink-0" />
                                            <span>Due {new Date(todo.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Task Actions */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setShowHistory(showHistory === todo.id ? null : todo.id)}
                                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium 
                                        rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    <MdHistory size={16} className="mr-1" />
                                    History
                                </button>
                            </div>

                            {/* History Section */}
                            {showHistory === todo.id && todo.history && (
                                <div className="mt-3 pl-3 border-l-2 border-gray-200">
                                    <h4 className="text-xs font-medium text-gray-500 mb-2">History</h4>
                                    <div className="space-y-2">
                                        {todo.history.map((entry, index) => (
                                            <div key={index} className="text-xs text-gray-500">
                                                <time className="font-medium">
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </time>
                                                <p className="mt-0.5">{entry.details}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <TodoModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedTodo(null);
                }}
                onSubmit={handleSubmit}
                initialData={selectedTodo}
            />
        </div>
    );
}
