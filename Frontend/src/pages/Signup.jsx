import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authService } from "../services/api";
import { Terminal, Eye, EyeOff, Loader2 } from "lucide-react";

export const Signup = ({ onShowToast }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Call the register endpoint which stores state in Redis and sends OTP
      await authService.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.emailId,
        password: data.password,
      });
      onShowToast("success", "OTP sent successfully! Check your email.");
      // Navigate to OTP verify page with email state
      navigate("/verify-otp", { state: { emailId: data.emailId } });
    } catch (error) {
      onShowToast("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-bg px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-8 bg-dark-card border border-dark-border p-8 rounded-2xl shadow-2xl relative">
        {/* Logo / Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label
                className="block text-sm font-medium text-gray-400 mb-1.5"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className={`w-full px-4 py-2.5 bg-dark-input border ${errors.firstName ? "border-red-500" : "border-dark-border focus:border-primary"} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
                placeholder="John"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 3,
                    message: "Min length is 3 characters",
                  },
                  maxLength: {
                    value: 20,
                    message: "Max length is 20 characters",
                  },
                })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                className="block text-sm font-medium text-gray-400 mb-1.5"
                htmlFor="lastName"
              >
                Last Name (Optional)
              </label>
              <input
                id="lastName"
                type="text"
                className={`w-full px-4 py-2.5 bg-dark-input border ${errors.lastName ? "border-red-500" : "border-dark-border focus:border-primary"} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
                placeholder="Doe"
                {...register("lastName", {
                  minLength: {
                    value: 3,
                    message: "Min length is 3 characters",
                  },
                  maxLength: {
                    value: 20,
                    message: "Max length is 20 characters",
                  },
                })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label
              className="block text-sm font-medium text-gray-400 mb-1.5"
              htmlFor="emailId"
            >
              Email Address
            </label>
            <input
              id="emailId"
              type="email"
              className={`w-full px-4 py-2.5 bg-dark-input border ${errors.emailId ? "border-red-500" : "border-dark-border focus:border-primary"} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
              placeholder="name@domain.com"
              {...register("emailId", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.emailId && (
              <p className="mt-1 text-xs text-red-500">
                {errors.emailId.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              className="block text-sm font-medium text-gray-400 mb-1.5"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`w-full pl-4 pr-10 py-2.5 bg-dark-input border ${errors.password ? "border-red-500" : "border-dark-border focus:border-primary"} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  validate: {
                    strong: (v) => {
                      // Validate same as validator.isStrongPassword
                      const hasLength = v.length >= 8;
                      const hasUpper = /[A-Z]/.test(v);
                      const hasLower = /[a-z]/.test(v);
                      const hasDigit = /[0-9]/.test(v);
                      const hasSpecial = /[^A-Za-z0-9]/.test(v);
                      return (
                        (hasLength &&
                          hasUpper &&
                          hasLower &&
                          hasDigit &&
                          hasSpecial) ||
                        "Password must be at least 8 characters, containing uppercase, lowercase, number, and special character"
                      );
                    },
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 leading-normal">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              className="block text-sm font-medium text-gray-400 mb-1.5"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full pl-4 pr-10 py-2.5 bg-dark-input border ${errors.confirmPassword ? "border-red-500" : "border-dark-border focus:border-primary"} rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors`}
                placeholder="••••••••"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: {
                    matches: (v) =>
                      v === watch("password") || "Passwords do not match",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 leading-normal">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating OTP...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
