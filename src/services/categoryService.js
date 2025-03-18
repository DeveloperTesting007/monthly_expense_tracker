import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    orderBy,
    getDoc,
    limit
} from 'firebase/firestore';

// Add utility function to generate category_id
const generateCategoryId = (type, name) => {
    const cleanName = name.trim()
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, ''); // Remove any special characters
    return `${type.toUpperCase()}_${cleanName}`;
};

// Add a new category
export const addCategory = async (userId, categoryData) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryData.name) throw new Error('Category name is required');
    if (!categoryData.type) throw new Error('Category type is required');

    try {
        const category_id = generateCategoryId(categoryData.type, categoryData.name);

        // Check if category_id already exists
        const duplicateQuery = query(
            collection(db, 'categories'),
            where('category_id', '==', category_id),
            where('userId', '==', userId)
        );

        const duplicateSnapshot = await getDocs(duplicateQuery);
        if (!duplicateSnapshot.empty) {
            throw new Error('A category with this name and type already exists');
        }

        const category = {
            name: categoryData.name.trim(),
            type: categoryData.type.toLowerCase(),
            status: categoryData.status || 'active',
            category_id,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'categories'), category);
        return { id: docRef.id, ...category };
    } catch (error) {
        console.error('Add category error:', error);
        if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to create categories');
        }
        throw new Error('Failed to add category: ' + error.message);
    }
};

// Update getCategories to include userId
export const getCategories = async (userId) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const categoriesRef = collection(db, 'categories');
        // Create a simpler query first
        const q = query(
            categoriesRef,
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const categories = {
            expense: [],
            income: []
        };

        // Sort after fetching
        const sortedDocs = snapshot.docs.sort((a, b) => {
            const nameA = a.data().name.toLowerCase();
            const nameB = b.data().name.toLowerCase();
            return nameA.localeCompare(nameB);
        });

        sortedDocs.forEach((doc) => {
            const data = doc.data();
            const category = {
                id: doc.id,
                ...data,
                category_id: data.category_id || generateCategoryId(data.type, data.name)
            };
            if (category.type && (category.type === 'expense' || category.type === 'income')) {
                categories[category.type].push(category);
            }
        });

        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories: ' + error.message);
    }
};

// Update updateCategory to verify userId
export const updateCategory = async (userId, categoryId, categoryData) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryId) throw new Error('Category ID is required');

    try {
        // Reference the category document directly in the categories collection
        const categoryRef = doc(db, 'categories', categoryId);

        // Verify ownership before updating
        const categorySnap = await getDoc(categoryRef);
        if (!categorySnap.exists()) {
            throw new Error('Category not found');
        }

        if (categorySnap.data().userId !== userId) {
            throw new Error('You do not have permission to update this category');
        }

        // Prepare update data
        const updateData = {
            name: categoryData.name.trim(),
            type: categoryData.type.toLowerCase(),
            status: categoryData.status || 'active',
            updatedAt: serverTimestamp()
        };

        await updateDoc(categoryRef, updateData);
        return { id: categoryId, ...updateData, userId };
    } catch (error) {
        console.error('Error updating category:', error);
        throw new Error(error.message || 'Failed to update category');
    }
};

// Update deleteCategory to verify userId
export const deleteCategory = async (userId, categoryId) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryId) throw new Error('Category ID is required');

    try {
        // Get the category reference
        const categoryRef = doc(db, 'categories', categoryId);

        // Verify ownership before deleting
        const categorySnap = await getDoc(categoryRef);
        if (!categorySnap.exists()) {
            throw new Error('Category not found');
        }

        const categoryData = categorySnap.data();
        if (categoryData.userId !== userId) {
            throw new Error('You do not have permission to delete this category');
        }

        // Check if category is being used in any transactions
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            where('categoryId', '==', categoryId),
            where('userId', '==', userId),
            limit(1)
        );

        const transactionsSnap = await getDocs(transactionsQuery);
        if (!transactionsSnap.empty) {
            throw new Error('Cannot delete category because it is being used in transactions');
        }

        // Perform the deletion
        await deleteDoc(categoryRef);
        return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
        console.error('Delete category error:', error);
        throw new Error(error.message || 'Failed to delete category');
    }
};
