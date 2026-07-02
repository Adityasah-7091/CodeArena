import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { problemService } from "../services/api";
import { Loader } from "../components/Loader";
import { Search, SlidersHorizontal, BookOpen, AlertCircle } from "lucide-react";

export const ProblemList = ({ onShowToast }) => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const data = await problemService.getAllProblems();
                setProblems(data || []);
            } catch (error) {
                // If it is 404 No problems, treat as empty list rather than error
                if (error.message.includes("404") || error.message.includes("No problems")) {
                    setProblems([]);
                } else {
                    onShowToast("error", "Failed to fetch challenges: " + error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, [onShowToast]);

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case "Easy":
                return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
            case "Medium":
                return "text-amber-400 border-amber-500/20 bg-amber-500/10";
            case "Hard":
                return "text-rose-400 border-rose-500/20 bg-rose-500/10";
            default:
                return "text-gray-400 border-dark-border bg-dark-card";
        }
    };

    // Filter problems
    const filteredProblems = problems.filter((prob) => {
        const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = selectedDifficulty === "All" || prob.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) return <Loader message="Scouting coding arenas..." />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-dark-bg text-gray-100">
            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span>Problem Set</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">Select a challenge and start submitting your solutions.</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search className="h-4.5 w-4.5" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none transition-colors"
                    />
                </div>

                {/* Difficulty Filters */}
                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                    <SlidersHorizontal className="h-4 w-4 text-gray-500 shrink-0 mr-1" />
                    {["All", "Easy", "Medium", "Hard"].map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                selectedDifficulty === diff
                                    ? "bg-primary text-white border-primary"
                                    : "bg-dark-input text-gray-400 border-dark-border hover:border-gray-500 hover:text-white"
                            }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {filteredProblems.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-white">No challenges found</p>
                    <p className="text-xs mt-1">Try resetting filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProblems.map((prob) => (
                        <div
                            key={prob._id}
                            className="bg-dark-card border border-dark-border p-5 rounded-xl flex items-center justify-between hover:border-primary/30 transition-all hover-scale"
                        >
                            <div className="space-y-2 max-w-[70%]">
                                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                                    {prob.title}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border ${getDifficultyColor(prob.difficulty)}`}>
                                        {prob.difficulty}
                                    </span>
                                    {prob.topics?.map((topic, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-dark-input border border-dark-border text-gray-400"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Link
                                to={`/problems/${prob._id}`}
                                className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-lg border border-primary/20 hover:border-primary transition-all duration-200"
                            >
                                Solve
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProblemList;
