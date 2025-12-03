import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/70 backdrop-blur-md w-full max-w-2xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden"
                >
                    <div className="flex justify-between items-center p-4 border-b border-slate-200/60 bg-white/80">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {children}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Modal;