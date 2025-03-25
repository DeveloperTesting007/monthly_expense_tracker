import React, { useState, useEffect } from 'react';
import { 
    MdCheckCircle, MdRadioButtonUnchecked, MdEdit, 
    MdDelete, MdAccessTime, MdMoreVert 
} from 'react-icons/md';
import { useTodo } from '../contexts/TodoContext';
import TodoModal from './TodoModal';

export default function TodoList({ onUpdate, autoLoad = false }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [previousStatus, setPreviousStatus] = useState({});
    const { todos, isLoading, fetchTodos, updateTodo, deleteTodo } = useTodo();

    useEffect(() => {
        if (autoLoad) {
            fetchTodos();
        }
    }, [fetchTodos, autoLoad]);

    const handleEdit = (todo) => {
        setSelectedTodo(todo);
        setIsEditModalOpen(true);
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

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-700',
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
            {/* Task List */}
            <div className="divide-y divide-gray-100">
                {todos.map((todo) => (
                    <div
                        key={todo._id}
                        className="group flex items-start sm:items-center gap-3 py-2.5 sm:py-3 
                            hover:bg-gray-50 transition-colors duration-150 rounded-lg px-2 sm:px-3"
                    >
                        {/* Status Toggle */}
                        <button
                            onClick={() => handleStatusToggle(todo)}
                            className="p-0.5 sm:p-1 mt-0.5 rounded-full hover:bg-gray-100 transition-colors"
                            title="Click to change status"
                        >
                            {getStatusIcon(todo.status)}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h3 className={`text-sm font-medium truncate
                                    ${todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {todo.title}
                                </h3>
                                {/* Status Badge */}
                                <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full
                                    text-xs font-medium ${getStatusColor(todo.status)}`}>
                                    {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                                </span>
                            </div>

                            {/* Due Date */}
                            {todo.dueDate && (
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="inline-flex items-center text-[11px] sm:text-xs text-gray-500">
                                        <MdAccessTime className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                        {new Date(todo.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-150">
                            <button
                                onClick={() => handleEdit(todo)}
                                className="p-0.5 sm:p-1 text-gray-400 hover:text-gray-500 
                                    hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MdEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(todo._id)}
                                className="p-0.5 sm:p-1 text-gray-400 hover:text-red-500 
                                    hover:bg-red-50 rounded-full transition-colors"
                            >
                                <MdDelete className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button className="p-0.5 sm:p-1 text-gray-400 hover:text-gray-500 
                                hover:bg-gray-100 rounded-full transition-colors">
                                <MdMoreVert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <TodoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdate}
                initialData={selectedTodo}
            />
        </div>
    );
}
