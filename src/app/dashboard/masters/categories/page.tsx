'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import { CategoryModal } from '@/components/modal/category-modal';
import { DeleteCategoryModal } from '@/components/modal/delete-category-modal';
import { toast } from '@/lib/toast';
import { formatDate } from '@/lib/format';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface Category {
  id: number;
  name: string;
  description: string;
  topicsCount: number;
  status: 'Active' | 'Draft' | 'Inactive';
  createdAt: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  totalTopics: number;
  averageTopicsPerCategory: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
    totalTopics: 0,
    averageTopicsPerCategory: '0'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const result = await apiService.get(API_ENDPOINTS.CATEGORIES.BASE, { params });
      
      if (result.success && result.data) {
        const categoriesData = result.data;
        setCategories(categoriesData);
        
        // Calculate stats from the categories data
        const total = result.meta?.total || categoriesData.length;
        const active = categoriesData.filter((cat: Category) => cat.status === 'Active').length;
        const draft = categoriesData.filter((cat: Category) => cat.status === 'Draft').length;
        const inactive = categoriesData.filter((cat: Category) => cat.status === 'Inactive').length;
        const totalTopics = categoriesData.reduce((sum: number, cat: Category) => sum + (cat.topicsCount || 0), 0);
        const averageTopicsPerCategory = total > 0 ? (totalTopics / total).toFixed(1) : '0';
        
        setStats({
          total,
          active,
          draft,
          inactive,
          totalTopics,
          averageTopicsPerCategory
        });
      } else {
        toast.error('Failed to fetch categories. Please try again.');
        console.error('Failed to fetch categories:', result.error);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Create or update category
  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'topicsCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const result = await apiService.put(API_ENDPOINTS.CATEGORIES.BY_ID(selectedCategory.id), categoryData);
        
        if (result.success) {
          await fetchCategories(); // Refresh the list
          setIsEditModalOpen(false);
          setSelectedCategory(null);
          toast.success('Category updated successfully');
        } else {
          toast.error(result.error || 'Failed to update category');
          throw new Error(result.error);
        }
      } else {
        // Create new category
        const result = await apiService.post(API_ENDPOINTS.CATEGORIES.BASE, categoryData);
        
        if (result.success) {
          await fetchCategories(); // Refresh the list
          setIsAddModalOpen(false);
          toast.success('Category created successfully');
        } else {
          toast.error(result.error || 'Failed to create category');
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      const result = await apiService.delete(API_ENDPOINTS.CATEGORIES.BY_ID(categoryToDelete.id));
      
      if (result.success) {
        await fetchCategories(); // Refresh the list
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        toast.success('Category deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete category');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Handle edit button click
  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Load categories on component mount and debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, searchTerm ? 300 : 0); // No delay on initial load, 300ms delay for search

    return () => clearTimeout(timer);
  }, [fetchCategories]);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Categories Management</h1>
            <p className='text-muted-foreground'>
              Organize your topics into categories for better navigation
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchCategories}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Categories</CardTitle>
              <FolderOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.total}</div>
              <p className='text-xs text-muted-foreground'>
                All categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Categories</CardTitle>
              <FolderOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.active}</div>
              <p className='text-xs text-muted-foreground'>
                {loading || stats.total === 0 ? '-' : Math.round((stats.active / stats.total) * 100)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Topics</CardTitle>
              <FolderOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.totalTopics}</div>
              <p className='text-xs text-muted-foreground'>
                Across all categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Avg Topics/Category</CardTitle>
              <FolderOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.averageTopicsPerCategory}</div>
              <p className='text-xs text-muted-foreground'>
                Well balanced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              Manage and organize your topic categories
            </CardDescription>
            <div className='flex space-x-2'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input 
                  placeholder='Search categories...' 
                  className='pl-8'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {searchTerm ? 'No categories found matching your search.' : 'No categories found. Create your first category!'}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {categories.map((category) => (
                  <div key={category.id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-2 bg-blue-100 rounded-lg'>
                        <FolderOpen className='h-6 w-6 text-blue-600' />
                      </div>
                      <div>
                        <p className='font-medium'>{category.name}</p>
                        <p className='text-sm text-muted-foreground'>{category.description}</p>
                        <p className='text-xs text-muted-foreground'>
                          Created: {category.createdAt ? formatDate(category.createdAt, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>{category.topicsCount} topics</p>
                        <Badge className={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </div>
                      <div className='flex space-x-2'>
                        <Button 
                          variant='outline' 
                          size='sm'
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button 
                          variant='outline' 
                          size='sm'
                          onClick={() => handleDeleteClick(category)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <CategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveCategory}
          category={null}
        />

        <CategoryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
          category={selectedCategory}
        />

        <DeleteCategoryModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={handleDeleteCategory}
          categoryName={categoryToDelete?.name || ''}
          topicsCount={categoryToDelete?.topicsCount || 0}
        />
      </div>
    </PageContainer>
  );
}
