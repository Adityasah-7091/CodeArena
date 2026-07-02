import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { authService } from "../services/api";
import { MailOpen, Loader2, RefreshCw, ArrowLeft } from "lucide-react";

export const OTPVerification = ({ onShowToast }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const emailId = location.state?.emailId || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    // Timers: Expiry (300s) and Cooldown (60s)
    const [expiryTime, setExpiryTime] = useState(300);
    const [cooldown, setCooldown] = useState(60);

    // Redirect if no email state exists
    useEffect(() => {
        if (!emailId) {
            onShowToast("error", "Invalid session. Please register first.");
            navigate("/signup");
        }
    }, [emailId, navigate, onShowToast]);

    // Expiry timer effect
    useEffect(() => {
        if (expiryTime <= 0) return;
        const timer = setInterval(() => {
            setExpiryTime((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [expiryTime]);

    // Cooldown timer effect
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            onShowToast("warning", "Please enter a valid 6-digit OTP");
            return;
        }

        if (expiryTime <= 0) {
            onShowToast("error", "OTP has expired. Please resend a new OTP or sign up again.");
            return;
        }

        setLoading(true);
        try {
            // Verify OTP
            const result = await authService.verifyOtp(emailId, otp);
            
            // Get user profile (confirm token cookie is fully set and readable)
            const userProfile = await authService.getProfile();
            
            // Store credentials in Redux
            dispatch(setCredentials({ user: userProfile }));
            onShowToast("success", result.message || "Account verified successfully!");
            navigate("/dashboard");
        } catch (error) {
            onShowToast("error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;

        setResending(true);
        try {
            const result = await authService.resendOtp(emailId);
            onShowToast("success", result || "New OTP sent to your email!");
            // Reset timers
            setExpiryTime(300);
            setCooldown(60);
            setOtp("");
        } catch (error) {
            onShowToast("error", error.message);
        } finally {
            setResending(false);
        }
    };

    if (!emailId) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-bg px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-dark-card border border-dark-border p-8 rounded-2xl shadow-2xl relative">
                {/* Back button */}
                <button
                    onClick={() => navigate("/signup")}
                    className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center text-xs space-x-1.5 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                </button>

                {/* Icon / Header */}
                <div className="text-center pt-4">
                    <div className="mx-auto h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4">
                        <MailOpen className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Verify Email</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        We sent a 6-digit code to <span className="text-white font-semibold">{emailId}</span>
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 text-center" htmlFor="otp">
                            Enter 6-Digit OTP
                        </label>
                        <input
                            id="otp"
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full text-center text-3xl font-extrabold tracking-[0.75em] pl-[0.375em] py-3 bg-dark-input border border-dark-border focus:border-primary rounded-xl text-white focus:outline-none transition-colors code-textarea"
                            placeholder="000000"
                            required
                        />

                        {/* Expiry Countdown */}
                        <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                            <span>Verification attempts: max 3</span>
                            {expiryTime > 0 ? (
                                <span className="text-gray-400">
                                    Expires in: <span className="text-amber-500 font-semibold">{formatTime(expiryTime)}</span>
                                </span>
                            ) : (
                                <span className="text-red-500 font-semibold">OTP Expired</span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || expiryTime <= 0}
                            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Verify & Login</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={cooldown > 0 || resending}
                            className="w-full py-2.5 border border-dark-border hover:border-gray-500 bg-dark-card text-gray-300 hover:text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                                <RefreshCw className="h-4 w-4 text-gray-400" />
                            )}
                            <span>
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP Code"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
