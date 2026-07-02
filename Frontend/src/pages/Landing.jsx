import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Terminal, Award, Cpu, Code2, ArrowRight, CheckCircle2 } from "lucide-react";

export const Landing = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-dark-bg text-gray-100 overflow-hidden">
            {/* Background decorative gradients */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-dark-border bg-dark-card/50 text-xs font-semibold text-primary">
                        <Code2 className="h-4 w-4" />
                        <span>Ready, Set, Code!</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                        <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                            The Ultimate Arena for
                        </span>
                        <span className="block text-primary mt-2">
                            Competitive Programmers
                        </span>
                    </h1>

                    <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
                        Practice coding challenges, compile code in real-time, test solutions, and master algorithms in our developer-friendly arena.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={isAuthenticated ? "/problems" : "/signup"}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                        >
                            <span>Start Solving</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-6 py-3 border border-dark-border hover:border-gray-500 bg-dark-card hover:bg-dark-hover text-gray-300 hover:text-white font-medium rounded-lg transition-all"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-primary/30 transition-all hover-scale">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit mb-4">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Real-Time Execution</h3>
                        <p className="text-gray-400 text-sm">
                            Submit and run code instantly using our execution engine. Supports C++, Java, and JavaScript.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-primary/30 transition-all hover-scale">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit mb-4">
                            <Terminal className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Algorithm Challenges</h3>
                        <p className="text-gray-400 text-sm">
                            Solve a wide array of curated problems across data structures, math, algorithms, and dynamic programming.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-primary/30 transition-all hover-scale">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit mb-4">
                            <Award className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Progress Statistics</h3>
                        <p className="text-gray-400 text-sm">
                            Track your success rate, solved questions count, and difficulty distribution over time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
