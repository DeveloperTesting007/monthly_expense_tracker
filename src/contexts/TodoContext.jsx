import React, { createContext, useContext, useState, useCallback } from 'react';
import { TodoService } from '../services/todoService';
import { useAuth } from './AuthContext';

const TodoContext = createContext();

export const DEFAULT_STATS = {
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0,
    details: { pending: 0, inProgress: 0 }
};

export function TodoProvider({ children }) {
    const [stats, setStats] = useState(DEFAULT_STATS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [todos, setTodos] = useState([]);
    const { currentUser } = useAuth();

    const fetchTodoStats = useCallback(async () => {
        if (!currentUser?.uid) return;

        setIsLoading(true);
        try {
            const stats = await TodoService.getTodoStats(currentUser.uid);
            setStats(stats);
            setError(null);
        } catch (error) {
            console.error('Error fetching todo stats:', error);
            setError('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.uid]);

    const fetchTodos = useCallback(async () => {
        if (!currentUser?.uid) return;
        setIsLoading(true);
        try {
            const fetchedTodos = await TodoService.getTodos(currentUser.uid);
            setTodos(fetchedTodos);
            setError(null);
        } catch (err) {
            setError('Failed to load todos');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.uid]);

    const addTodo = useCallback(async (todoData) => {
        if (!currentUser?.uid) return;
        try {
            const newTodo = await TodoService.addTodo(currentUser.uid, todoData);
            setTodos(prev => [...prev, newTodo]);
            await fetchTodoStats();
            return newTodo;
        } catch (err) {
            setError('Failed to add todo');
            throw err;
        }
    }, [currentUser?.uid, fetchTodoStats]);

    const updateTodo = useCallback(async (todoId, updates) => {
        try {
            await TodoService.updateTodo(todoId, updates);
            setTodos(prev => prev.map(todo => 
                todo.id === todoId ? { ...todo, ...updates } : todo
            ));
            await fetchTodoStats();
        } catch (err) {
            setError('Failed to update todo');
            throw err;
        }
    }, [fetchTodoStats]);

    const deleteTodo = useCallback(async (todoId) => {
        try {
            await TodoService.deleteTodo(todoId);
            setTodos(prev => prev.filter(todo => todo.id !== todoId));
            await fetchTodoStats();
        } catch (err) {
            setError('Failed to delete todo');
            throw err;
        }
    }, [fetchTodoStats]);

    const value = {
        stats,
        isLoading,
        error,
        setError,
        fetchTodoStats,
        todos,
        fetchTodos,
        addTodo,
        updateTodo,
        deleteTodo
    };

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export const useTodo = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodo must be used within a TodoProvider');
    }
    return context;
};
