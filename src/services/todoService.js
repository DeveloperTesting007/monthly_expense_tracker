import { db } from '../config/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from 'firebase/firestore';

export class TodoService {
    static getTodosRef(userId) {
        return collection(db, 'monthly_tracker', userId, 'todos');
    }

    static getTodoDoc(userId, todoId) {
        return doc(db, 'monthly_tracker', userId, 'todos', todoId);
    }

    static async getTodoStats(userId) {
        if (!userId) return null;

        const todosRef = this.getTodosRef(userId);
        const querySnapshot = await getDocs(todosRef);
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

        return {
            total: todos.length,
            completed: statusCounts.completed,
            pending: statusCounts.pending + statusCounts.inProgress,
            urgent: statusCounts.urgent,
            details: {
                pending: statusCounts.pending,
                inProgress: statusCounts.inProgress
            }
        };
    }

    static async getTodos(userId) {
        const todosRef = this.getTodosRef(userId);
        // Create a compound query that matches the index
        const q = query(
            todosRef,
            orderBy('priority', 'desc'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async addTodo(userId, todoData) {
        const todosRef = this.getTodosRef(userId);
        const todo = {
            ...todoData,
            createdAt: new Date().toISOString(),
            status: todoData.status || 'pending',
            priority: todoData.priority || 0, // 0: Low, 1: Medium, 2: High
            dueDate: todoData.dueDate || null,
            completed: false,
            comments: [],
            history: [{
                action: 'created',
                timestamp: new Date().toISOString(),
                details: 'Task created'
            }]
        };
        
        if (todoData.comment) {
            todo.comments.push({
                text: todoData.comment,
                timestamp: new Date().toISOString()
            });
        }
        
        const docRef = await addDoc(todosRef, todo);
        return { id: docRef.id, ...todo };
    }

    static async updateTodo(userId, todoId, updates) {
        const todoRef = this.getTodoDoc(userId, todoId);
        const docSnap = await getDoc(todoRef);
        const currentData = docSnap.data();

        const historyEntry = {
            action: 'updated',
            timestamp: new Date().toISOString(),
            details: this.generateHistoryDetails(currentData, updates)
        };

        const updatedData = {
            ...updates,
            history: [...(currentData.history || []), historyEntry]
        };

        await updateDoc(todoRef, updatedData);
        return { id: todoId, ...currentData, ...updatedData };
    }

    static generateHistoryDetails(oldData, newData) {
        const changes = [];
        if (oldData.status !== newData.status) {
            changes.push(`Status changed from ${oldData.status} to ${newData.status}`);
        }
        if (oldData.priority !== newData.priority) {
            changes.push(`Priority changed from ${this.getPriorityLabel(oldData.priority)} to ${this.getPriorityLabel(newData.priority)}`);
        }
        if (oldData.title !== newData.title) {
            changes.push('Title updated');
        }
        if (oldData.dueDate !== newData.dueDate) {
            changes.push('Due date updated');
        }
        if (newData.comment) {
            changes.push('Comment added');
        }
        return changes.join(', ');
    }

    static getPriorityLabel(priority) {
        const priorities = ['Low', 'Medium', 'High'];
        return priorities[priority] || 'Unknown';
    }

    static async deleteTodo(userId, todoId) {
        const todoRef = this.getTodoDoc(userId, todoId);
        await deleteDoc(todoRef);
        return todoId;
    }
}
