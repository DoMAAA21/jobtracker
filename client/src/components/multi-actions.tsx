import { Button } from '@/components/ui/button';
import { Trash, ArchiveRestoreIcon, X } from 'lucide-react';

interface MultiActionsProps<T> {
    onMultiDelete?: () => void;
    onMultiRestore?: () => void;
    onMultiSendEmail?: () => void;
    selectedRows: T[];
    onClearSelection?: () => void;
    variant?: 'dropdown' | 'fixed';
}

const isRowWithDeleted = (row: any): row is { isDeleted: boolean } => {
    return row && typeof row.isDeleted === 'boolean';
};

export const MultiActions = <T,>({
    onMultiDelete,
    onMultiRestore,
    onMultiSendEmail,
    selectedRows,
    onClearSelection,
    variant = 'dropdown'
}: MultiActionsProps<T>) => {
    const hasDeletedRows = selectedRows.some(row => isRowWithDeleted(row) && row.isDeleted);
    const hasNonDeletedRows = selectedRows.some(row => isRowWithDeleted(row) && !row.isDeleted);

    if (variant === 'fixed') {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg p-4 min-w-[200px]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedRows.length} selected
                        </span>
                        {onClearSelection && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearSelection}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        {hasNonDeletedRows && (
                            <Button
                                onClick={onMultiDelete}
                                variant="destructive"
                                size="sm"
                                className="w-full flex items-center justify-center space-x-2 text-white cursor-pointer"
                            >
                                <Trash className="w-4 h-4" />
                                Delete ({selectedRows.filter(row => isRowWithDeleted(row) && !row.isDeleted).length})
                            </Button>
                        )}
                        {hasDeletedRows && (
                            <Button
                                onClick={onMultiRestore}
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center space-x-2 cursor-pointer"
                            >
                                <ArchiveRestoreIcon className="w-4 h-4" />
                                Restore ({selectedRows.filter(row => isRowWithDeleted(row) && row.isDeleted).length})
                            </Button>
                        )}
                        {onMultiSendEmail && (
                            <Button
                                onClick={onMultiSendEmail}
                                variant="outline"
                                size="sm"
                                className="w-full cursor-pointer"
                            >
                                Send Email ({selectedRows.length})
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex space-x-2">
            {hasNonDeletedRows && (
                <Button onClick={onMultiDelete} variant="destructive" className="text-white flex items-center space-x-2">
                    <Trash className="mr-2" />
                    Delete
                </Button>
            )}

            {hasDeletedRows && (
                <Button onClick={onMultiRestore} variant="secondary" className="flex items-center space-x-2">
                    <ArchiveRestoreIcon className="mr-2" />
                    Restore
                </Button>
            )}
        </div>
    );
};