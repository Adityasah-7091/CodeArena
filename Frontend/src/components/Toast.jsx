import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export const Toast = ({ type = "success", message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close in 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const getColors = () => {
        switch (type) {
            case "success":
                return {
                    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    icon: <CheckCircle className="h-5 w-5 text-emerald-400" />
                };
            case "error":
                return {
                    bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
                    icon: <XCircle className="h-5 w-5 text-rose-400" />
                };
            case "warning":
                return {
                    bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                    icon: <AlertTriangle className="h-5 w-5 text-amber-400" />
                };
            default:
                return {
                    bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                    icon: <CheckCircle className="h-5 w-5 text-blue-400" />
                };
        }
    };

    const colors = getColors();

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border ${colors.bg} shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in`}>
            {colors.icon}
            <span className="text-sm font-medium pr-2">{message}</span>
            <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded-md transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Toast;
