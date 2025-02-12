import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MdAdd, MdDelete, MdEdit, MdCheck, MdRefresh, MdFlag, MdAccessTime, MdSort, MdFilterList } from 'react-icons/md';

export default function TodoList({ onUpdate, autoLoad = true }) {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loadingTodoId, setLoadingTodoId] = useState(null);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [filterStatus, setFilterStatus] = useState('all');

    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
        { value: 'in-progress', label: 'In Progress', color: 'text-blue-500', bgColor: 'bg-blue-100' },
        { value: 'completed', label: 'Completed', color: 'text-green-500', bgColor: 'bg-green-100' },
        { value: 'urgent', label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-100' }
    ];

    const sortOptions = [
        { value: 'createdAt', label: 'Created Date' },
        { value: 'dueDate', label: 'Due Date' },
        { value: 'status', label: 'Status' },
        { value: 'text', label: 'Task Name' }
    ];

    useEffect(() => {
        if (autoLoad) {
            fetchTodos();
        }
    }, [currentUser, autoLoad]);

    // Add cleanup effect
    useEffect(() => {
        return () => {
            setIsLoading(false);
            setLoadingTodoId(null);
        };
    }, []);

    const fetchTodos = async () => {
        if (!currentUser?.uid) {
            setError('User not authenticated');
            return;
        }

        try {
            const q = query(
                collection(db, 'todos'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const todosData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            setTodos(todosData);
            if (onUpdate) onUpdate();

        } catch (error) {
            console.error('Error fetching todos:', error);
            setError(error.message);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim() || !currentUser?.uid) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'todos'), {
                text: newTodo,
                completed: false,
                status: 'pending',
                priority: 'normal',
                userId: currentUser.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
                dueDate: null,
                notes: '',
                history: [{
                    status: 'pending',
                    timestamp: new Date(),
                    note: 'Task created'
                }]
            });
            setNewTodo('');
            await fetchTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
            if (error.code === 'permission-denied') {
                alert('Permission denied. Please try logging in again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTodo = async (todoId, completed) => {
        if (!currentUser?.uid) return;

        try {
            await updateDoc(doc(db, 'todos', todoId), {
                completed: !completed,
                updatedAt: new Date()
            });
            await fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const deleteTodo = async (todoId) => {
        if (!currentUser?.uid) return;

        try {
            await deleteDoc(doc(db, 'todos', todoId));
            await fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const startEditing = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
    };

    const updateTodo = async () => {
        if (!editText.trim() || !currentUser?.uid) return;

        try {
            await updateDoc(doc(db, 'todos', editingId), {
                text: editText,
                updatedAt: new Date()
            });
            setEditingId(null);
            setEditText('');
            await fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const handleRefresh = () => {
        fetchTodos();
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return {
            text: statusOption?.color || 'text-gray-500',
            bg: statusOption?.bgColor || 'bg-gray-100'
        };
    };

    const updateTodoStatus = async (todoId, newStatus) => {
        try {
            const todoRef = doc(db, 'todos', todoId);
            const currentTodo = todos.find(t => t.id === todoId);

            if (!currentTodo) {
                throw new Error('Todo not found');
            }

            const now = new Date();
            await updateDoc(todoRef, {
                status: newStatus,
                updatedAt: now,
                completed: newStatus === 'completed',
                history: [...(currentTodo.history || []), {
                    status: newStatus,
                    timestamp: now,
                    note: `Status changed from ${currentTodo.status} to ${newStatus}`,
                    updatedBy: currentUser.email
                }]
            });

            // Update local state immediately
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === todoId
                        ? { ...todo, status: newStatus, completed: newStatus === 'completed' }
                        : todo
                )
            );

            // Trigger immediate stats update
            if (onUpdate) {
                onUpdate();
            }

        } catch (error) {
            console.error('Error updating todo status:', error);
            setError(error.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : date.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(d);
    };

    const getSortedTodos = () => {
        let filteredTodos = [...todos];

        // Apply status filter
        if (filterStatus !== 'all') {
            filteredTodos = filteredTodos.filter(todo => todo.status === filterStatus);
        }

        // First sort by urgency
        filteredTodos.sort((a, b) => {
            // Urgent tasks always come first
            if (a.status === 'urgent' && b.status !== 'urgent') return -1;
            if (b.status === 'urgent' && a.status !== 'urgent') return 1;

            // Then apply the selected sort
            switch (sortBy) {
                case 'dueDate':
                    return (a.dueDate || '') > (b.dueDate || '') ? 1 : -1;
                case 'status':
                    return a.status > b.status ? 1 : -1;
                case 'text':
                    return a.text.localeCompare(b.text);
                default:
                    // For created date, newer items first
                    return b.createdAt - a.createdAt;
            }
        });

        return filteredTodos;
    };

    const TodoDetails = ({ todo }) => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900">{todo.text}</h3>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex gap-2">
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => updateTodoStatus(todo.id, option.value)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium 
                                        ${todo.status === option.value
                                            ? 'bg-gray-100 ' + option.color
                                            : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                            type="datetime-local"
                            value={todo.dueDate || ''}
                            onChange={async (e) => {
                                await updateDoc(doc(db, 'todos', todo.id), {
                                    dueDate: e.target.value,
                                    updatedAt: new Date()
                                });
                                fetchTodos();
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="mb-6"></div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                        value={todo.notes || ''}
                        onChange={async (e) => {
                            await updateDoc(doc(db, 'todos', todo.id), {
                                notes: e.target.value,
                                updatedAt: new Date()
                            });
                            fetchTodos();
                        }}
                        className="w-full px-3 py-2 border rounded-lg h-32"
                        placeholder="Add notes here..."
                    />
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">History</h4>
                    <div className="space-y-3">
                        {[...(todo.history || [])].reverse().map((record, idx) => (
                            <div key={idx} className="flex gap-3 text-sm">
                                <div className="text-gray-400">
                                    {new Date(record.timestamp?.seconds * 1000).toLocaleString()}
                                </div>
                                <div className="text-gray-600">{record.note}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );


    return (
        <div className="w-full">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-between shadow-sm">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl transition-all duration-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-md"
                    >
                        <MdRefresh size={20} />
                    </button>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2.5 border rounded-xl text-sm w-full sm:w-auto focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-shadow"
                    >
                        <option value="all">All Status</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl w-full sm:w-auto">
                        <MdSort className="text-gray-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm focus:outline-none w-full"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>Sort by {option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <form onSubmit={addTodo} className="mb-6">
                <div className="flex gap-3 p-1">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-grow p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <MdAdd size={20} />
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                {getSortedTodos().map((todo) => (
                    <div
                        key={todo.id}
                        className={`group flex items-center gap-3 p-4 border rounded-xl transition-all duration-200 hover:shadow-md
                            ${getStatusColor(todo.status).bg}`}
                    >
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id, todo.completed)}
                            className="h-5 w-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                                            {todo.text}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Created {formatDate(todo.createdAt)}
                                        </span>
                                    </div>
                                    {todo.status === 'urgent' && (
                                        <span className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 font-medium">
                                            Urgent
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        {statusOptions.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => updateTodoStatus(todo.id, option.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                    ${todo.status === option.value
                                                        ? `${option.bgColor} ${option.color} shadow-sm`
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    {todo.dueDate && (
                                        <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                            <MdAccessTime size={14} />
                                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setSelectedTodo(todo); setShowDetails(true); }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                title="View Details"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => startEditing(todo)}
                                className="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            >
                                <MdEdit size={20} />
                            </button>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                                <MdDelete size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {
                showDetails && selectedTodo && (
                    <TodoDetails todo={selectedTodo} />
                )
            }
        </div >
    );
}
