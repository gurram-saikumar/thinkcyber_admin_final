'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  termsTitle: string;
}

export function DeleteTermsModal({ isOpen, onClose, onConfirm, termsTitle }: DeleteTermsModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting terms:', error);
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-red-500' />
            Delete Terms and Conditions
          </DialogTitle>
        </DialogHeader>
        
        <div className='py-4'>
          <p className='text-sm text-muted-foreground mb-4'>
            Are you sure you want to delete the following terms and conditions? This action cannot be undone.
          </p>
          <div className='bg-gray-50 p-3 rounded-lg'>
            <p className='font-medium text-sm'>{termsTitle}</p>
          </div>
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
          <Button 
            type='button'
            variant='destructive'
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Delete Terms
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
