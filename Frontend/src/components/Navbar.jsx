import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { authService } from "../services/api";
import { Terminal, LogOut, User, Database, ListChecks, Award } from "lucide-react";

export const Navbar = ({ onShowToast }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            dispatch(logoutUser());
            onShowToast("success", "Logged out successfully");
            navigate("/login");
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="border-b border-dark-border bg-dark-card/85 backdrop-blur-md sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl group">
                            <div className="bg-primary/20 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                <Terminal className="h-5 w-5" />
                            </div>
                            <span className="tracking-wider bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                Code<span className="text-primary font-extrabold">Arena</span>
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-1 ml-10">
                            {isAuthenticated && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                            isActive("/dashboard")
                                                ? "text-primary bg-primary/10"
                                                : "text-gray-400 hover:text-white hover:bg-dark-hover"
                                        }`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/problems"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                            isActive("/problems")
                                                ? "text-primary bg-primary/10"
                                                : "text-gray-400 hover:text-white hover:bg-dark-hover"
                                        }`}
                                    >
                                        Problems
                                    </Link>
                                    <Link
                                        to="/submissions"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                            isActive("/submissions")
                                                ? "text-primary bg-primary/10"
                                                : "text-gray-400 hover:text-white hover:bg-dark-hover"
                                        }`}
                                    >
                                        Submissions
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Right-Side Actions */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-circle border border-dark-border bg-dark-bg hover:border-primary/50 flex items-center justify-center">
                                    <span className="text-primary font-bold text-lg">
                                        {user?.firstName?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                </label>
                                <ul
                                    tabIndex={0}
                                    className="menu dropdown-content mt-3 z-[1] p-2 shadow-2xl bg-dark-card border border-dark-border rounded-xl w-52 text-gray-300"
                                >
                                    <div className="px-4 py-2 border-b border-dark-border text-xs mb-1">
                                        <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName || ""}</p>
                                        <p className="text-gray-500 truncate">{user?.emailId}</p>
                                    </div>
                                    <li>
                                        <Link to="/profile" className="hover:text-white py-2">
                                            <User className="h-4 w-4 mr-2" />
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard" className="hover:text-white py-2">
                                            <Database className="h-4 w-4 mr-2" />
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} className="hover:text-red-400 py-2 text-red-500">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
