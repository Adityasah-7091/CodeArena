import React from "react";

export const Loader = ({ message = "Loading challenges..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[400px]">
            <div className="relative w-16 h-16">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                {/* Inner Ring */}
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">{message}</p>
        </div>
    );
};

export default Loader;
