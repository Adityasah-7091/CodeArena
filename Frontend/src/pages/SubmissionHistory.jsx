import React, { useState, useEffect } from "react";
import { submissionService } from "../services/api";
import { Loader } from "../components/Loader";
import { CheckCircle2, XCircle, Code2, Calendar, HardDrive, Cpu, X, FileCode } from "lucide-react";

export const SubmissionHistory = ({ onShowToast }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await submissionService.getSubmissions();
                setSubmissions(data || []);
            } catch (error) {
                onShowToast("error", "Failed to fetch submission history: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [onShowToast]);

    const getStatusColor = (status) => {
        if (status === "Accepted") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
        return "text-rose-400 border-rose-500/20 bg-rose-500/10";
    };

    if (loading) return <Loader message="Fetching submission scroll..." />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-dark-bg text-gray-100">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Code2 className="h-6 w-6 text-primary" />
                    <span>Submission History</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">Review all your previous compilations and submissions.</p>
            </div>

            {/* Table or Empty State */}
            {submissions.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center text-gray-500">
                    <Code2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-white">No submissions yet</p>
                    <p className="text-xs mt-1">Select a challenge and test your compiler skills!</p>
                </div>
            ) : (
                <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="table w-full text-gray-300">
                            <thead>
                                <tr className="border-b border-dark-border text-gray-500 bg-dark-bg/30">
                                    <th>Challenge</th>
                                    <th>Status</th>
                                    <th>Runtime</th>
                                    <th>Memory</th>
                                    <th>Test Cases</th>
                                    <th>Language</th>
                                    <th>Date</th>
                                    <th className="text-right">Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub._id} className="border-b border-dark-border hover:bg-dark-hover/40 transition-colors">
                                        <td className="font-semibold text-white">
                                            {sub.problem_id?.title || "Deleted Challenge"}
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(sub.status)}`}>
                                                {sub.status === "Accepted" ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>{sub.status === "Accepted" ? `${sub.runtime}s` : "N/A"}</td>
                                        <td>{sub.status === "Accepted" ? `${sub.space} KB` : "N/A"}</td>
                                        <td className="text-xs">
                                            {sub.testCasePassed} / {sub.totalTestCases || 0} passed
                                        </td>
                                        <td className="uppercase text-xs font-semibold text-gray-400">{sub.language}</td>
                                        <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => setSelectedCode({
                                                    title: sub.problem_id?.title || "Solution",
                                                    code: sub.code,
                                                    language: sub.language
                                                })}
                                                className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 flex items-center space-x-1 ml-auto"
                                            >
                                                <FileCode className="h-3 w-3" />
                                                <span>View</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Code Modal */}
            {selectedCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-dark-card border border-dark-border w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scale-up max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedCode.title}</h3>
                                <p className="text-xs text-gray-400 capitalize mt-0.5">Language: {selectedCode.language}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCode(null)}
                                className="p-1 text-gray-400 hover:text-white hover:bg-dark-hover rounded-md transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-6 overflow-y-auto bg-[#0e0e11] font-mono text-xs sm:text-sm text-gray-200 whitespace-pre scrollbar">
                            {selectedCode.code}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionHistory;
