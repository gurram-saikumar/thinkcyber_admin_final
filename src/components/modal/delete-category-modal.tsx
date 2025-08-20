'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
  topicsCount: number;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  topicsCount
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting category:', error);
      // You can add toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <Modal
      title="Delete Category"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="space-y-4">
        {/* Warning Icon and Message */}
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              Are you sure you want to delete "{categoryName}"?
            </p>
            <p className="text-sm text-red-600 mt-1">
              This category contains {topicsCount} topic{topicsCount !== 1 ? 's' : ''}. 
              {topicsCount > 0 && ' All associated topics will also be affected.'}
            </p>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            This will permanently delete the category and may affect related content. 
            Make sure you have backed up any important data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
