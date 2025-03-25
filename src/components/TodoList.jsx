import React, { useEffect, useState } from 'react';
import { useTodo } from '../contexts/TodoContext';
import { MdHistory, MdEdit, MdDelete, MdPriorityHigh } from 'react-icons/md';
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

    const getPriorityColor = (priority) => {
        const colors = ['text-gray-500', 'text-yellow-500', 'text-red-500'];
        return colors[priority] || colors[0];
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Add Task
                </button>
            </div>

            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li key={todo.id} className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-2">
                                <MdPriorityHigh className={getPriorityColor(todo.priority)} />
                                <span>{todo.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={todo.priority}
                                    onChange={(e) => handlePriorityChange(todo.id, e.target.value)}
                                    className="px-2 py-1 border rounded"
                                >
                                    <option value={0}>Low</option>
                                    <option value={1}>Medium</option>
                                    <option value={2}>High</option>
                                </select>
                                <select
                                    value={todo.status}
                                    onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                                    className="px-2 py-1 border rounded"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <button
                                    onClick={() => setShowHistory(showHistory === todo.id ? null : todo.id)}
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                >
                                    <MdHistory size={20} />
                                </button>
                                <button
                                    onClick={() => handleOpenModal(todo)}
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                >
                                    <MdEdit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="px-2 py-1 text-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        {showHistory === todo.id && todo.history && (
                            <div className="ml-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2">History</h4>
                                <ul className="space-y-1">
                                    {todo.history.map((entry, index) => (
                                        <li key={index} className="text-sm text-gray-600">
                                            {new Date(entry.timestamp).toLocaleString()}: {entry.details}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

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
