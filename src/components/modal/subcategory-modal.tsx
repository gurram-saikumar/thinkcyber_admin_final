'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Draft' | 'Inactive';
}

interface SubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subCategory: SubCategory) => Promise<void>;
  subCategory?: SubCategory | null;
  categories: Category[];
  loading?: boolean;
}

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subCategory,
  categories,
  loading = false
}) => {
  const [formData, setFormData] = useState<SubCategory>({
    name: '',
    description: '',
    categoryId: 0,
    status: 'Active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or subCategory changes
  useEffect(() => {
    if (isOpen) {
      if (subCategory) {
        // Edit mode
        setFormData({
          id: subCategory.id,
          name: subCategory.name || '',
          description: subCategory.description || '',
          categoryId: subCategory.categoryId || 0,
          status: subCategory.status || 'Active'
        });
      } else {
        // Add mode
        setFormData({
          name: '',
          description: '',
          categoryId: categories.length > 0 ? categories[0].id : 0,
          status: 'Active'
        });
      }
      setErrors({});
    }
  }, [isOpen, subCategory, categories]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Sub-category name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Sub-category name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      newErrors.categoryId = 'Parent category is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SubCategory, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving sub-category:', error);
      // You can add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      title={subCategory ? 'Edit Sub-Category' : 'Add New Sub-Category'}
      description={subCategory ? 'Update the sub-category information below.' : 'Create a new sub-category within a parent category.'}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sub-Category Name */}
        <div className="space-y-2">
          <Label htmlFor="subcategory-name">Sub-Category Name *</Label>
          <Input
            id="subcategory-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter sub-category name"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="subcategory-description">Description *</Label>
          <Textarea
            id="subcategory-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter sub-category description"
            className={`min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Parent Category */}
        <div className="space-y-2">
          <Label htmlFor="parent-category">Parent Category *</Label>
          <Select
            value={formData.categoryId.toString()}
            onValueChange={(value) => handleInputChange('categoryId', parseInt(value))}
            disabled={isSubmitting}
          >
            <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="subcategory-status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              subCategory ? 'Update Sub-Category' : 'Create Sub-Category'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
