import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { problemService, authService } from "../services/api";
import { Loader } from "../components/Loader";
import { logoutUser } from "../redux/authSlice";
import { useForm } from "react-hook-form";
import { User, Mail, Shield, CheckCircle2, Calendar, Award, Code, Trash2, PlusCircle, UserPlus, X, ShieldAlert, Loader2 } from "lucide-react";

export const Profile = ({ onShowToast }) => {
    const { user } = useSelector((state) => state.auth);
    const [solvedList, setSolvedList] = useState([]);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Modal and action states
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteText, setDeleteText] = useState("");
    const [registering, setRegistering] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form hook for register admin/user
    const { 
        register: registerField, 
        handleSubmit: handleSubmitRegister, 
        formState: { errors: registerErrors },
        reset: resetRegisterForm
    } = useForm();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await problemService.getSolvedProblems();
                setSolvedList((data || []).filter(Boolean));
            } catch (error) {
                onShowToast("error", "Failed to fetch solved problems: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [onShowToast]);

    const onRegisterSubmit = async (data) => {
        setRegistering(true);
        try {
            await authService.registerAdminOrUser({
                firstName: data.firstName,
                lastName: data.lastName,
                emailId: data.emailId,
                password: data.password,
                role: data.role
            });
            onShowToast("success", `${data.role === "admin" ? "Admin" : "User"} registered successfully!`);
            setShowRegisterModal(false);
            resetRegisterForm();
        } catch (error) {
            onShowToast("error", error.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteText !== "DELETE") return;
        setDeleting(true);
        try {
            await authService.deleteAccount();
            onShowToast("success", "Account deleted successfully.");
            dispatch(logoutUser());
            navigate("/login");
        } catch (error) {
            onShowToast("error", error.message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <Loader message="Accessing profile dossier..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-dark-bg text-gray-100">
            {/* Header / Basic Card */}
            <div className="bg-dark-card border border-dark-border p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                {/* Avatar */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-primary/10 border-2 border-primary/30 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold">
                    {user?.firstName?.charAt(0).toUpperCase()}
                </div>

                {/* Details */}
                <div className="text-center sm:text-left space-y-2 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {user?.firstName} {user?.lastName || ""}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <span className="flex items-center justify-center sm:justify-start">
                            <Mail className="h-4 w-4 mr-1.5 text-gray-500" />
                            {user?.emailId}
                        </span>
                        <span className="hidden sm:inline text-gray-600">|</span>
                        <span className="flex items-center justify-center sm:justify-start capitalize">
                            <Shield className="h-4 w-4 mr-1.5 text-gray-500" />
                            Role: {user?.role || "User"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats Summary */}
                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 shadow-lg">
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span>Platform Milestones</span>
                    </h2>
                    <hr className="border-dark-border" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-dark-input rounded-xl border border-dark-border text-center">
                            <p className="text-xs text-gray-400 font-semibold mb-1">Solved Challenges</p>
                            <p className="text-3xl font-extrabold text-white">{solvedList.length}</p>
                        </div>
                        <div className="p-4 bg-dark-input rounded-xl border border-dark-border text-center">
                            <p className="text-xs text-gray-400 font-semibold mb-1">Account Created</p>
                            <p className="text-sm font-bold text-white pt-2.5">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Solved Problems Details list */}
                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex flex-col shadow-lg max-h-[350px]">
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span>Solved Problems</span>
                    </h2>
                    {solvedList.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-6">
                            <Code className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No solved problems yet.</p>
                            <Link to="/problems" className="text-xs text-primary hover:underline mt-1">Start coding</Link>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-2 scrollbar pr-1">
                            {solvedList.map((prob) => (
                                <Link
                                    key={prob._id}
                                    to={`/problems/${prob._id}`}
                                    className="p-3 bg-dark-input hover:bg-dark-hover/45 border border-dark-border rounded-lg flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-200 transition-colors"
                                >
                                    <span className="truncate max-w-[70%]">{prob.title}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold border ${
                                        prob.difficulty === "Easy" ? "text-emerald-400 border-emerald-500/10 bg-emerald-500/5" :
                                        prob.difficulty === "Medium" ? "text-amber-400 border-amber-500/10 bg-amber-500/5" :
                                        "text-rose-400 border-rose-500/10 bg-rose-500/5"
                                    }`}>
                                        {prob.difficulty}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Controls (Only visible to Admin role) */}
            {user?.role === "admin" && (
                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 shadow-lg">
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Admin Console</span>
                    </h2>
                    <hr className="border-dark-border" />
                    <div className="flex flex-wrap gap-4">
                        <Link 
                            to="/admin/create-problem" 
                            className="btn btn-primary btn-sm flex items-center space-x-1.5 shadow-md shadow-primary/15"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Create New Problem</span>
                        </Link>
                        <button 
                            onClick={() => setShowRegisterModal(true)} 
                            className="btn btn-sm btn-ghost border border-dark-border text-gray-300 hover:text-white flex items-center space-x-1.5"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>Register User/Admin</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Danger Zone */}
            <div className="bg-dark-card border border-red-900/40 p-6 rounded-2xl space-y-4 shadow-lg bg-red-950/5">
                <h2 className="text-lg font-bold text-red-500 flex items-center space-x-2">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Danger Zone</span>
                </h2>
                <hr className="border-red-950/40" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-white">Delete Account</h3>
                        <p className="text-xs text-gray-400">Permanently delete your account and all associated submissions. This cannot be undone.</p>
                    </div>
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn btn-error btn-sm border-none bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                    </button>
                </div>
            </div>

            {/* Register Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                        <button 
                            onClick={() => {
                                setShowRegisterModal(false);
                                resetRegisterForm();
                            }} 
                            className="absolute right-4 top-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4">Register User or Admin</h3>
                        <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">First Name</label>
                                <input 
                                    type="text" 
                                    className={`w-full px-3 py-2 bg-dark-input border ${registerErrors.firstName ? 'border-red-500' : 'border-dark-border focus:border-primary'} rounded-lg text-white text-sm focus:outline-none`}
                                    placeholder="Jane"
                                    {...registerField("firstName", { required: "First name is required" })}
                                />
                                {registerErrors.firstName && <p className="text-[10px] text-red-500 mt-1">{registerErrors.firstName.message}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Last Name (Optional)</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none"
                                    placeholder="Doe"
                                    {...registerField("lastName")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    className={`w-full px-3 py-2 bg-dark-input border ${registerErrors.emailId ? 'border-red-500' : 'border-dark-border focus:border-primary'} rounded-lg text-white text-sm focus:outline-none`}
                                    placeholder="jane.doe@example.com"
                                    {...registerField("emailId", { 
                                        required: "Email is required",
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                                    })}
                                />
                                {registerErrors.emailId && <p className="text-[10px] text-red-500 mt-1">{registerErrors.emailId.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                                <input 
                                    type="password" 
                                    className={`w-full px-3 py-2 bg-dark-input border ${registerErrors.password ? 'border-red-500' : 'border-dark-border focus:border-primary'} rounded-lg text-white text-sm focus:outline-none`}
                                    placeholder="••••••••"
                                    {...registerField("password", { 
                                        required: "Password is required",
                                        validate: (v) => {
                                            const hasLength = v.length >= 8;
                                            const hasUpper = /[A-Z]/.test(v);
                                            const hasLower = /[a-z]/.test(v);
                                            const hasDigit = /[0-9]/.test(v);
                                            const hasSpecial = /[^A-Za-z0-9]/.test(v);
                                            return (hasLength && hasUpper && hasLower && hasDigit && hasSpecial) || "Password must be strong (8+ chars, upper, lower, number, special)";
                                        }
                                    })}
                                />
                                {registerErrors.password && <p className="text-[10px] text-red-500 mt-1">{registerErrors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Role</label>
                                <select 
                                    className="w-full px-3 py-2 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none"
                                    {...registerField("role", { required: "Role is required" })}
                                    defaultValue="user"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={registering}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 transition-colors mt-2"
                            >
                                {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                <span>Register Account</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-dark-card border border-red-900/40 rounded-2xl w-full max-w-md p-6 relative shadow-2xl bg-red-950/10">
                        <button 
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteText("");
                            }} 
                            className="absolute right-4 top-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-3 mb-4 text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                            <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
                        </div>
                        <p className="text-sm text-gray-300 leading-normal mb-4">
                            This will immediately delete your user profile and remove all of your submission history forever.
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                            Please type <span className="text-red-400 font-mono select-none">DELETE</span> to confirm:
                        </p>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-dark-input border border-dark-border focus:border-red-500 rounded-lg text-white text-sm focus:outline-none font-mono mb-4"
                            placeholder="DELETE"
                            value={deleteText}
                            onChange={(e) => setDeleteText(e.target.value)}
                        />
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteText("");
                                }} 
                                className="flex-1 py-2 bg-dark-hover hover:bg-dark-border border border-dark-border text-gray-300 font-medium text-sm rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={deleteText !== "DELETE" || deleting}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900/40 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span>Delete Forever</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
