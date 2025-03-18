import React, { useState, useEffect } from 'react';
import { MdClose, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { 
    CATEGORY_TYPES, 
    CATEGORY_STATUS} from '../../constants/categoryConstants';

const TypeButton = ({ type, selected, onClick, icon: Icon, disabled }) => (
    <button
        type="button"
        onClick={() => onClick(type)}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
            ${selected 
                ? type === CATEGORY_TYPES.EXPENSE
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <Icon className={`w-5 h-5 ${selected 
            ? type === CATEGORY_TYPES.EXPENSE ? 'text-red-600' : 'text-green-600'
            : 'text-gray-500'}`} 
        />
        <span className="font-medium capitalize">{type}</span>
    </button>
);

const FormField = ({ label, error, children }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
            {label} {error && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && (
            <p className="text-sm text-red-600">{error}</p>
        )}
    </div>
);

export default function CategoryForm({ 
    onSubmit, 
    onCancel, 
    isSubmitting = false,
    initialData = null,
    title = "Add New Category"
}) {
    const [formData, setFormData] = useState({
        name: '',
        type: CATEGORY_TYPES.EXPENSE,
        status: CATEGORY_STATUS.ACTIVE,
        ...initialData
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const validate = (data) => {
        const errors = {};
        if (!data.name.trim()) {
            errors.name = 'Category name is required';
        } else if (data.name.trim().length < 2) {
            errors.name = 'Category name must be at least 2 characters';
        }
        if (!Object.values(CATEGORY_TYPES).includes(data.type)) {
            errors.type = 'Invalid category type';
        }
        return errors;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
        
        const newData = { ...formData, [field]: value };
        const validationErrors = validate(newData);
        setErrors(validationErrors);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length === 0) {
            onSubmit({
                ...formData,
                name: formData.name.trim()
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-500 rounded-full"
                    >
                        <MdClose className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Type Selection */}
                <FormField label="Type" error={errors.type}>
                    <div className="grid grid-cols-2 gap-4">
                        <TypeButton
                            type={CATEGORY_TYPES.EXPENSE}
                            selected={formData.type === CATEGORY_TYPES.EXPENSE}
                            onClick={(type) => handleChange('type', type)}
                            icon={MdTrendingDown}
                            disabled={isSubmitting}
                        />
                        <TypeButton
                            type={CATEGORY_TYPES.INCOME}
                            selected={formData.type === CATEGORY_TYPES.INCOME}
                            onClick={(type) => handleChange('type', type)}
                            icon={MdTrendingUp}
                            disabled={isSubmitting}
                        />
                    </div>
                </FormField>

                {/* Name Input */}
                <FormField label="Category Name" error={errors.name}>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                            ${errors.name ? 'border-red-300' : 'border-gray-300'}
                            ${touched.name && !errors.name && formData.name ? 'border-green-300' : ''}`}
                        placeholder="Enter category name"
                        disabled={isSubmitting}
                    />
                </FormField>

                {/* Status Selection */}
                <FormField label="Status">
                    <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        disabled={isSubmitting}
                    >
                        {Object.entries(CATEGORY_STATUS).map(([key, value]) => (
                            <option key={key} value={value}>
                                {key.charAt(0) + key.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                            border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                        rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>{initialData ? 'Update' : 'Add'} Category</span>
                    )}
                </button>
            </div>
        </form>
    );
}
