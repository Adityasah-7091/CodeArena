import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { problemService, submissionService } from "../services/api";
import Editor from "@monaco-editor/react";
import { Loader } from "../components/Loader";
import { Play, Code2, Send, HelpCircle, CheckCircle2, XCircle, AlertTriangle, Terminal, ChevronRight, Loader2 } from "lucide-react";

export const ProblemDetails = ({ onShowToast }) => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Code State
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("preferred_language") || "javascript";
    });
    const [code, setCode] = useState("");
    
    // Output States
    const [activeTab, setActiveTab] = useState("description"); // description, hint
    const [runResults, setRunResults] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [consoleOpen, setConsoleOpen] = useState(false);

    // Default template fallback codes matching CodeChef defaults with user edits
    const defaultTemplates = {
        c: `#include <stdio.h>\n\nint main(void) {\n\t// write your code here\n\treturn 0;\n}`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\t// write your code here\n\treturn 0;\n}`,
        java: `import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\nclass Main\n{\n\tpublic static void main (String[] args) throws java.lang.Exception\n\t{\n\t\t// write your code here\n\t}\n}`,
        javascript: `// write your code here`,
        python: `# write your code here`
    };

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await problemService.getProblemById(id);
                setProblem(data);
                
                const currentLang = localStorage.getItem("preferred_language") || "javascript";
                setLanguage(currentLang);

                // Initialize start code if provided in backend, else fallback to template
                if (data.startCode && data.startCode.length > 0) {
                    const match = data.startCode.find(c => c.language.toLowerCase() === currentLang.toLowerCase());
                    if (match) {
                        setCode(match.initialCode);
                    } else {
                        setCode(defaultTemplates[currentLang]);
                    }
                } else {
                    setCode(defaultTemplates[currentLang]);
                }
            } catch (error) {
                onShowToast("error", "Failed to load challenge details: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id, onShowToast]);

    // Update code template when language changes
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem("preferred_language", newLang);
        if (problem?.startCode && problem.startCode.length > 0) {
            const match = problem.startCode.find(c => c.language.toLowerCase() === newLang.toLowerCase());
            if (match) {
                setCode(match.initialCode);
                return;
            }
        }
        setCode(defaultTemplates[newLang]);
    };

    const handleRun = async () => {
        setRunning(true);
        setConsoleOpen(true);
        setRunResults(null);
        setSubmitResult(null);
        try {
            const results = await submissionService.run(id, code, language);
            setRunResults(results);
            const failedCase = results.find(result => result.status.id !== 3);
            if (failedCase) {
                onShowToast("error", `Test Case Failed: ${failedCase.status.description}`);
            } else {
                onShowToast("success", "All visible test cases passed!");
            }
        } catch (error) {
            onShowToast("error", "Execution failed: " + error.message);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setConsoleOpen(true);
        setRunResults(null);
        setSubmitResult(null);
        try {
            const result = await submissionService.submit(id, code, language);
            setSubmitResult(result);
            if (result.status === "Accepted") {
                onShowToast("success", "Congratulations! All test cases passed!");
            } else {
                onShowToast("error", `Submission failed: ${result.status}`);
            }
        } catch (error) {
            onShowToast("error", "Submission failed: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRunRef = useRef(handleRun);
    const handleSubmitRef = useRef(handleSubmit);

    useEffect(() => {
        handleRunRef.current = handleRun;
        handleSubmitRef.current = handleSubmit;
    }, [handleRun, handleSubmit]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === "'") {
                    e.preventDefault();
                    if (!running && !submitting) {
                        handleRunRef.current();
                    }
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (!running && !submitting) {
                        handleSubmitRef.current();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [running, submitting]);

    const handleEditorDidMount = (editor, monaco) => {
        // Register Ctrl + ' for Run inside Editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_QUOTE, () => {
            if (!running && !submitting) {
                handleRunRef.current();
            }
        });

        // Register Ctrl + Enter for Submit inside Editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (!running && !submitting) {
                handleSubmitRef.current();
            }
        });
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case "Easy": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
            case "Medium": return "text-amber-400 border-amber-500/20 bg-amber-500/10";
            case "Hard": return "text-rose-400 border-rose-500/20 bg-rose-500/10";
            default: return "text-gray-400";
        }
    };

    if (loading) return <Loader message="Compiling challenge data..." />;
    if (!problem) return <div className="text-center py-12 text-gray-500">Problem not found.</div>;

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-dark-bg text-gray-200">
            {/* Left Pane - Description & Hints */}
            <div className="w-full lg:w-1/2 border-r border-dark-border flex flex-col h-[50vh] lg:h-[calc(100vh-4rem)]">
                {/* Tab Navigation */}
                <div className="flex border-b border-dark-border bg-dark-card/50 text-sm">
                    <button
                        onClick={() => setActiveTab("description")}
                        className={`px-6 py-3 font-semibold border-b-2 transition-all ${
                            activeTab === "description" ? "border-primary text-white" : "border-transparent text-gray-400 hover:text-white"
                        }`}
                    >
                        Description
                    </button>
                    {problem.hint && problem.hint.length > 0 && (
                        <button
                            onClick={() => setActiveTab("hint")}
                            className={`px-6 py-3 font-semibold border-b-2 transition-all ${
                                activeTab === "hint" ? "border-primary text-white" : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            Hints
                        </button>
                    )}
                </div>

                {/* Left Pane Contents */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === "description" ? (
                        <>
                            {/* Problem Title & Header */}
                            <div>
                                <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                    {problem.topics?.map((topic, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-dark-card border border-dark-border text-gray-400">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Description markdown style */}
                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                                {problem.description}
                            </div>

                            {/* Visible Test Cases */}
                            <div className="space-y-4">
                                <h3 className="text-md font-bold text-white flex items-center space-x-1.5">
                                    <Terminal className="h-4 w-4 text-primary" />
                                    <span>Examples</span>
                                </h3>
                                <div className="space-y-4">
                                    {problem.visibleTestCases?.map((tc, index) => (
                                        <div key={index} className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-2 text-xs sm:text-sm">
                                            <p className="font-semibold text-gray-300">Example {index + 1}:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-semibold mb-1">Input:</p>
                                                    <pre className="bg-dark-bg p-2.5 rounded-lg border border-dark-border overflow-x-auto text-gray-300 font-mono leading-tight">{tc.input}</pre>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-semibold mb-1">Output:</p>
                                                    <pre className="bg-dark-bg p-2.5 rounded-lg border border-dark-border overflow-x-auto text-gray-300 font-mono leading-tight">{tc.output}</pre>
                                                </div>
                                            </div>
                                            {tc.explanation && (
                                                <div className="pt-2 text-xs text-gray-400 leading-normal border-t border-dark-border/40">
                                                    <span className="font-semibold text-gray-300">Explanation: </span>{tc.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4 text-sm">
                            <h3 className="text-md font-bold text-white flex items-center space-x-2">
                                <HelpCircle className="h-4 w-4 text-primary" />
                                <span>Hints</span>
                            </h3>
                            <div className="space-y-3">
                                {problem.hint?.map((h, i) => (
                                    <div key={i} className="bg-dark-card border border-dark-border p-4 rounded-xl">
                                        <p className="text-gray-400 font-semibold text-xs mb-1">Hint {i + 1}</p>
                                        <p className="text-gray-200">{h}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane - Editor & Console */}
            <div className="w-full lg:w-1/2 flex flex-col h-[50vh] lg:h-[calc(100vh-4rem)]">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-6 py-2.5 border-b border-dark-border bg-dark-card/50">
                    <div className="flex items-center space-x-2">
                        <Code2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-gray-300">Editor</span>
                    </div>

                    {/* Language selector */}
                    <div className="flex items-center space-x-2">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-dark-input border border-dark-border focus:border-primary rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none uppercase font-semibold transition-colors"
                        >
                            <option value="c">C</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                    </div>
                </div>

                {/* Editor Workspace */}
                <div className="flex-1 relative overflow-hidden bg-[#0e0e11]">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollbar: {
                                vertical: 'auto',
                                horizontal: 'auto'
                            },
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Editor Footer / Control Bar */}
                <div className="border-t border-dark-border bg-dark-card/85 p-4 flex justify-between items-center">
                    <button
                        onClick={() => setConsoleOpen(!consoleOpen)}
                        className={`text-xs px-3 py-2 rounded-lg border font-semibold transition-colors ${
                            consoleOpen ? "bg-dark-hover text-white border-gray-600" : "text-gray-400 border-dark-border hover:text-white"
                        }`}
                    >
                        Console {consoleOpen ? "▼" : "▲"}
                    </button>

                    <div className="flex items-center space-x-3">
                        {/* Run Button */}
                        <button
                            onClick={handleRun}
                            disabled={running || submitting}
                            className="btn btn-sm btn-ghost border border-dark-border text-gray-300 hover:text-white flex items-center space-x-1.5"
                        >
                            {running ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Play className="h-3.5 w-3.5" />
                            )}
                            <span>Run</span>
                        </button>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={running || submitting}
                            className="btn btn-sm btn-primary flex items-center space-x-1.5 shadow-md shadow-primary/15"
                        >
                            {submitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            <span>Submit</span>
                        </button>
                    </div>
                </div>

                {/* Console Panel */}
                {consoleOpen && (
                    <div className="border-t border-dark-border bg-dark-card h-[180px] overflow-y-auto flex flex-col">
                        <div className="px-4 py-2 border-b border-dark-border text-xs font-semibold text-gray-400 bg-dark-bg flex items-center justify-between">
                            <span>Execution Log</span>
                            <button onClick={() => setConsoleOpen(false)} className="hover:text-white font-bold">✕</button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed">
                            {running && <div className="text-gray-400 flex items-center space-x-1.5"><Loader2 className="h-3 w-3 animate-spin" /><span>Running tests...</span></div>}
                            {submitting && <div className="text-gray-400 flex items-center space-x-1.5"><Loader2 className="h-3 w-3 animate-spin" /><span>Submitting all test suites...</span></div>}

                            {/* Run Output */}
                            {runResults && (
                                <div className="space-y-3">
                                    <p className="font-bold text-gray-300">Visible Test Results:</p>
                                    {runResults.map((result, i) => (
                                        <div key={i} className="border-l-2 border-dark-border pl-3.5 py-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-white">Test Case {i + 1}:</span>
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                    result.status.id === 3 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                                                }`}>
                                                    {result.status.description}
                                                </span>
                                                <span className="text-[10px] text-gray-500">{result.time ? `${result.time}s` : ""}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1.5 mt-1.5 text-gray-400">
                                                {result.stdin && (
                                                    <div>
                                                        <span className="text-[10px] text-gray-600 block">Input</span>
                                                        <pre className="bg-dark-bg p-1.5 rounded text-[11px] font-semibold">{result.stdin}</pre>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-[10px] text-gray-600 block">Actual Output</span>
                                                        <pre className={`bg-dark-bg p-1.5 rounded text-[11px] font-semibold ${
                                                            result.status.id === 3 ? "text-emerald-400" : "text-rose-400"
                                                        }`}>{result.stdout !== undefined && result.stdout !== null ? result.stdout : "[Empty]"}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-600 block">Expected Output</span>
                                                        <pre className="bg-dark-bg p-1.5 rounded text-[11px] font-semibold text-gray-300">{result.expected_output || "[Empty]"}</pre>
                                                    </div>
                                                </div>
                                                {result.stderr && (
                                                    <div>
                                                        <span className="text-[10px] text-red-500 font-semibold block">Runtime Error (stderr)</span>
                                                        <pre className="bg-red-500/5 text-rose-400 p-2 rounded border border-red-500/10 text-[11px] leading-tight overflow-x-auto whitespace-pre-wrap">{result.stderr}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Submit Output */}
                            {submitResult && (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-300 text-sm">Status:</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                            submitResult.status === "Accepted" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                                        }`}>
                                            {submitResult.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400">Test Cases Passed: <span className="font-semibold text-white">{submitResult.testCasePassed} / {submitResult.totalTestCases}</span></p>
                                    {submitResult.status === "Accepted" && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 text-gray-400">
                                            <div><span className="text-[10px] text-gray-600 block">Runtime</span> <span className="text-white font-semibold">{submitResult.runtime}s</span></div>
                                            <div><span className="text-[10px] text-gray-600 block">Memory</span> <span className="text-white font-semibold">{submitResult.space} KB</span></div>
                                        </div>
                                    )}
                                    {submitResult.errorMessage && (
                                        <div className="pt-2">
                                            <span className="text-[10px] text-red-500 font-semibold block">Error Details:</span>
                                            <pre className="bg-red-500/5 text-rose-400 p-2.5 rounded border border-red-500/10 text-[11px] leading-tight overflow-x-auto whitespace-pre-wrap">{submitResult.errorMessage}</pre>
                                        </div>
                                    )}
                                    {submitResult.failedTestCase && (
                                        <div className="mt-3 border border-red-500/20 bg-red-500/5 rounded p-3 space-y-2 text-gray-400">
                                            <p className="font-semibold text-rose-400 text-xs">First Failed Hidden Test Case:</p>
                                            {submitResult.failedTestCase.input && (
                                                <div>
                                                    <span className="text-[10px] text-gray-600 block">Input</span>
                                                    <pre className="bg-dark-bg p-1.5 rounded text-[11px] font-semibold">{submitResult.failedTestCase.input}</pre>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-[10px] text-gray-600 block">Actual Output</span>
                                                    <pre className="bg-dark-bg p-1.5 rounded text-[11px] font-semibold text-rose-400">{submitResult.failedTestCase.actual_output !== undefined && submitResult.failedTestCase.actual_output !== null && submitResult.failedTestCase.actual_output !== "" ? submitResult.failedTestCase.actual_output : "[Empty]"}</pre>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-600 block">Expected Output</span>
                                                    <pre className="bg-dark-bg p-1.5 rounded text-[11px] font-semibold text-emerald-400">{submitResult.failedTestCase.expected_output}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!running && !submitting && !runResults && !submitResult && (
                                <div className="text-gray-500 text-center py-6">
                                    No outputs to display. Press "Run" or "Submit" to execute.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemDetails;
