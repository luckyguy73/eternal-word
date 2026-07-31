"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isDestructive = false
}: ConfirmDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-black border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-400" />
                        
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border bg-orange-400/10 border-orange-400/20">
                                {isDestructive ? (
                                    <FaTrash className="text-orange-400" size={24} />
                                ) : (
                                    <FaExclamationTriangle className="text-orange-400" size={24} />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">{message}</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 rounded-2xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-colors cursor-pointer text-sm"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-6 py-3 rounded-2xl font-bold transition-colors cursor-pointer text-sm bg-orange-400 text-black hover:bg-orange-300 shadow-lg shadow-orange-400/20"
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
