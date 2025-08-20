'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TermsAndConditions {
  id: number;
  title: string;
  content: string;
  version: string;
  language: string;
  status: 'Draft' | 'Published' | 'Archived' | 'Active';
  effectiveDate?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (terms: Omit<TermsAndConditions, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<void>;
  terms: TermsAndConditions | null;
}

export function TermsModal({ isOpen, onClose, onSave, terms }: TermsModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    version: '1.0',
    language: 'en',
    status: 'Draft' as 'Draft' | 'Published' | 'Archived' | 'Active',
    effectiveDate: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or terms changes
  useEffect(() => {
    if (isOpen) {
      if (terms) {
        // Edit mode
        setFormData({
          title: terms.title || '',
          content: terms.content || '',
          version: terms.version || '1.0',
          language: terms.language || 'en',
          status: terms.status || 'Draft',
          effectiveDate: terms.effectiveDate || '',
        });
      } else {
        // Add mode
        setFormData({
          title: '',
          content: '',
          version: '1.0',
          language: 'en',
          status: 'Draft',
          effectiveDate: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, terms]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    } else if (!/^\d+\.\d+$/.test(formData.version)) {
      newErrors.version = 'Version must be in format X.Y (e.g., 1.0, 2.1)';
    }

    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.effectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.effectiveDate)) {
      newErrors.effectiveDate = 'Effective date must be in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving terms:', error);
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {terms ? 'Edit Terms and Conditions' : 'Add New Terms and Conditions'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title *</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder='Enter title'
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className='text-sm text-red-500'>{errors.title}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='version'>Version *</Label>
              <Input
                id='version'
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                placeholder='e.g., 1.0, 2.1'
                className={errors.version ? 'border-red-500' : ''}
              />
              {errors.version && <p className='text-sm text-red-500'>{errors.version}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='language'>Language *</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='es'>Spanish</SelectItem>
                  <SelectItem value='fr'>French</SelectItem>
                  <SelectItem value='de'>German</SelectItem>
                  <SelectItem value='it'>Italian</SelectItem>
                  <SelectItem value='pt'>Portuguese</SelectItem>
                  <SelectItem value='ru'>Russian</SelectItem>
                  <SelectItem value='zh'>Chinese</SelectItem>
                  <SelectItem value='ja'>Japanese</SelectItem>
                  <SelectItem value='ko'>Korean</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && <p className='text-sm text-red-500'>{errors.language}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status'>Status *</Label>
              <Select value={formData.status} onValueChange={(value: 'Draft' | 'Published' | 'Archived' | 'Active') => handleInputChange('status', value)}>
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Draft'>Draft</SelectItem>
                  <SelectItem value='Published'>Published</SelectItem>
                  <SelectItem value='Active'>Active</SelectItem>
                  <SelectItem value='Archived'>Archived</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className='text-sm text-red-500'>{errors.status}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='effectiveDate'>Effective Date</Label>
              <Input
                id='effectiveDate'
                type='date'
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                className={errors.effectiveDate ? 'border-red-500' : ''}
              />
              {errors.effectiveDate && <p className='text-sm text-red-500'>{errors.effectiveDate}</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Content *</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => handleInputChange('content', value)}
              placeholder='Enter the terms and conditions content...'
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && <p className='text-sm text-red-500'>{errors.content}</p>}
            <p className='text-xs text-muted-foreground'>
              {formData.content.length} characters (minimum 50 required)
            </p>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {terms ? 'Update Terms' : 'Create Terms'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
