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
    getDoc
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
        const newCategoryId = generateCategoryId(categoryData.type, categoryData.name);

        // Check for duplicates excluding current document
        const duplicateQuery = query(
            collection(db, 'categories'),
            where('category_id', '==', newCategoryId),
            where('userId', '==', userId)
        );
        
        const duplicateSnapshot = await getDocs(duplicateQuery);
        const hasDuplicate = duplicateSnapshot.docs.some(doc => doc.id !== categoryId);
        
        if (hasDuplicate) {
            throw new Error('A category with this name and type already exists');
        }

        const updateData = {
            ...categoryData,
            category_id: newCategoryId,
            userId,
            updatedAt: serverTimestamp()
        };

        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, updateData);
        return { id: categoryId, ...updateData };
    } catch (error) {
        console.error('Update category error:', error);
        throw new Error('Failed to update category');
    }
};

// Update deleteCategory to verify userId
export const deleteCategory = async (userId, categoryId) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryId) throw new Error('Category ID is required');

    try {
        // Verify ownership before deleting
        const categoryRef = doc(db, 'categories', categoryId);
        const categorySnap = await getDoc(categoryRef);
        
        if (!categorySnap.exists() || categorySnap.data().userId !== userId) {
            throw new Error('Category not found or access denied');
        }

        await deleteDoc(categoryRef);
    } catch (error) {
        console.error('Delete category error:', error);
        throw new Error('Failed to delete category');
    }
};
