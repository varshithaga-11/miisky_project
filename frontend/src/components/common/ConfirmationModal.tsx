import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false
}) => {
    const variantColors = {
        danger: "bg-red-600 hover:bg-red-700 shadow-red-500/30",
        warning: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/30",
        info: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
    };

    const iconColors = {
        danger: "text-red-600 bg-red-50",
        warning: "text-orange-600 bg-orange-50",
        info: "text-blue-600 bg-blue-50",
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-8">
            <div className="flex flex-col items-center text-center">
                <div className={`size-16 rounded-2xl flex items-center justify-center mb-6 ${iconColors[variant]}`}>
                    <FiAlertTriangle size={32} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                    {title}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-4 px-6 rounded-2xl font-black text-gray-500 uppercase tracking-widest text-xs hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black text-white uppercase tracking-widest text-xs transition-all shadow-xl ${variantColors[variant]}`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
