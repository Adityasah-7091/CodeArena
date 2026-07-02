import React from "react";
import { Terminal } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-dark-card border-t border-dark-border py-8 text-gray-500 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-semibold mb-4 md:mb-0">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span>CodeArena</span>
                </div>
                <div>
                    <p>&copy; {new Date().getFullYear()} CodeArena. All rights reserved. Built for developers.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
