import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createRoot } from 'react-dom/client';

type ConfirmationPopUpProps = {
    title: string;
    message: string;
    onSuccess: () => void;
    onCancel?: () => void;
    confirmButton?: string;
    cancelButton?: string;
};

let resolveCallback: (confirmed: boolean) => void;

const ConfirmationPopUp = ({
    title,
    message,
    onSuccess,
    onCancel,
    confirmButton = "Confirm",
    cancelButton = "Cancel",
}: ConfirmationPopUpProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        setIsOpen(false);
        onSuccess();
        resolveCallback(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        onCancel?.();   
        resolveCallback(false);
    };

    useEffect(() => {
        setIsOpen(true);
    }, []);

    return createPortal(
        isOpen && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription className="py-4 text-lg text-black">{message}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={handleCancel}>
                            {cancelButton}
                        </Button>
                        <Button variant="default" className="bg-brand-dark-purple text-white hover:bg-brand-dark-purple/90 cursor-pointer" onClick={handleConfirm}>
                            {confirmButton}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        ),
        document.body
    );
};

type ShowConfirmationPopupProps = {
    title: string;
    message: string;
    confirmButton?: string;
    cancelButton?: string;
    onSuccess: () => void;
    onCancel?: () => void;
};

export const showConfirmationPopup = ({
    title,
    message,
    confirmButton = "Confirm",
    cancelButton = "Cancel",
    onCancel,
    onSuccess,
}: ShowConfirmationPopupProps): Promise<boolean> => {
    return new Promise((resolve) => {
        resolveCallback = resolve;

        const wrapper = document.createElement('div');
        document.body.appendChild(wrapper);

        const handleCleanup = () => {
            document.body.removeChild(wrapper);
        };

        const onPopupSuccess = () => {
            onSuccess();
            handleCleanup();
        };

        const root = createRoot(wrapper);
        root.render(
            <ConfirmationPopUp
                title={title}
                message={message}
                confirmButton={confirmButton}
                cancelButton={cancelButton}
                onSuccess={onPopupSuccess}
                onCancel={onCancel}
            />
        );
    });
};

export default ConfirmationPopUp;