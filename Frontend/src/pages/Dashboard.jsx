import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { problemService, submissionService } from "../services/api";
import { Loader } from "../components/Loader";
import { CheckCircle2, XCircle, Code2, Play, User, Clock, ShieldCheck, ChevronRight } from "lucide-react";

export const Dashboard = ({ onShowToast }) => {
    const { user } = useSelector((state) => state.auth);
    const [solvedList, setSolvedList] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [solvedData, subData] = await Promise.all([
                    problemService.getSolvedProblems(),
                    submissionService.getSubmissions()
                ]);
                setSolvedList((solvedData || []).filter(Boolean));
                setSubmissions(subData || []);
            } catch (error) {
                onShowToast("error", "Failed to load dashboard data: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [onShowToast]);

    if (loading) return <Loader message="Fetching dashboard metrics..." />;

    // Calculate difficulty statistics
    const stats = {
        Easy: solvedList.filter((p) => p && p.difficulty === "Easy").length,
        Medium: solvedList.filter((p) => p && p.difficulty === "Medium").length,
        Hard: solvedList.filter((p) => p && p.difficulty === "Hard").length,
        Total: solvedList.filter(Boolean).length
    };

    const getStatusColor = (status) => {
        if (status === "Accepted") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-dark-bg text-gray-100">
            {/* Header Greeting */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl font-bold">
                        {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {user?.firstName}!</h1>
                        <p className="text-xs sm:text-sm text-gray-400">Ready to tackle your next algorithm?</p>
                    </div>
                </div>
                <Link to="/problems" className="btn btn-primary btn-sm flex items-center space-x-1.5 shadow-md shadow-primary/15">
                    <span>Solve Problems</span>
                    <Play className="h-3.5 w-3.5 fill-current" />
                </Link>
            </div>

            {/* Performance Stats & Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Solved Card */}
                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-gray-400 mb-1">Total Solved</p>
                    <p className="text-5xl font-extrabold text-primary mb-2">{stats.Total}</p>
                    <span className="text-xs text-gray-500">problems solved successfully</span>
                </div>

                {/* Easy Card */}
                <div className="bg-dark-card border border-dark-border p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-400">Easy</span>
                        <span className="text-xs text-gray-500">Level</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold text-white">{stats.Easy}</p>
                        <p className="text-xs text-gray-400 mt-1">solved</p>
                    </div>
                    <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-emerald-500 h-full" style={{ width: `${stats.Total > 0 ? (stats.Easy / stats.Total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                {/* Medium Card */}
                <div className="bg-dark-card border border-dark-border p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-amber-400">Medium</span>
                        <span className="text-xs text-gray-500">Level</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold text-white">{stats.Medium}</p>
                        <p className="text-xs text-gray-400 mt-1">solved</p>
                    </div>
                    <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-amber-500 h-full" style={{ width: `${stats.Total > 0 ? (stats.Medium / stats.Total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                {/* Hard Card */}
                <div className="bg-dark-card border border-dark-border p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-rose-400">Hard</span>
                        <span className="text-xs text-gray-500">Level</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold text-white">{stats.Hard}</p>
                        <p className="text-xs text-gray-400 mt-1">solved</p>
                    </div>
                    <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-rose-500 h-full" style={{ width: `${stats.Total > 0 ? (stats.Hard / stats.Total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Recent Submissions Section */}
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-dark-border flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Recent Submissions</span>
                    </h2>
                    {submissions.length > 5 && (
                        <Link to="/submissions" className="text-xs text-primary hover:underline flex items-center">
                            <span>View All</span>
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>

                {submissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Code2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No submissions found.</p>
                        <p className="text-xs mt-1">Start writing code for a challenge to view your submission history!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full text-gray-300">
                            <thead>
                                <tr className="border-b border-dark-border text-gray-500">
                                    <th>Challenge</th>
                                    <th>Status</th>
                                    <th>Runtime</th>
                                    <th>Language</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 5).map((sub) => (
                                    <tr key={sub._id} className="border-b border-dark-border hover:bg-dark-hover/40 transition-colors">
                                        <td className="font-semibold text-white">
                                            {sub.problem_id?.title || "Deleted Challenge"}
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(sub.status)}`}>
                                                {sub.status === "Accepted" ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>{sub.status === "Accepted" ? `${sub.runtime}s` : "N/A"}</td>
                                        <td className="uppercase text-xs font-semibold text-gray-400">{sub.language}</td>
                                        <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
