import React, { useEffect, useState } from 'react';
import { useTodo } from '../contexts/TodoContext';

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

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTodoText.trim()) return;
        
        try {
            await addTodo({
                title: newTodoText,
                status: 'pending'
            });
            setNewTodoText('');
        } catch (err) {
            console.error('Failed to add todo:', err);
        }
    };

    const handleStatusChange = async (todoId, newStatus) => {
        try {
            await updateTodo(todoId, { status: newStatus });
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

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Add
                </button>
            </form>

            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li key={todo.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span>{todo.title}</span>
                        <div className="flex gap-2">
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
                                onClick={() => handleDelete(todo.id)}
                                className="px-2 py-1 text-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
