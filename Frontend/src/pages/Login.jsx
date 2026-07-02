import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { authService } from "../services/api";
import { Terminal, Eye, EyeOff, Loader2 } from "lucide-react";

export const Login = ({ onShowToast }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 1. Call login endpoint
            await authService.login(data.emailId, data.password);
            
            // 2. Fetch profile details (since login endpoint only returns string response)
            const userProfile = await authService.getProfile();
            
            // 3. Save to Redux and localstorage
            dispatch(setCredentials({ user: userProfile }));
            onShowToast("success", "Logged in successfully!");
            navigate("/dashboard");
        } catch (error) {
            onShowToast("error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-bg px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-dark-card border border-dark-border p-8 rounded-2xl shadow-2xl relative">
                {/* Logo / Header */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4">
                        <Terminal className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary hover:underline font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5" htmlFor="emailId">
                                Email Address
                            </label>
                            <input
                                id="emailId"
                                type="email"
                                autoComplete="email"
                                className={`w-full px-4 py-2.5 bg-dark-input border ${errors.emailId ? 'border-red-500' : 'border-dark-border focus:border-primary'} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                placeholder="name@domain.com"
                                {...register("emailId", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.emailId && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.emailId.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className={`w-full pl-4 pr-10 py-2.5 bg-dark-input border ${errors.password ? 'border-red-500' : 'border-dark-border focus:border-primary'} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                    placeholder="••••••••"
                                    {...register("password", { required: "Password is required" })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
