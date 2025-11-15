import React from 'react'
import { X } from 'lucide-react';

const Modal = ({ title, children, isOpen, onClose, className = '' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ${className}`}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
export default Modal;