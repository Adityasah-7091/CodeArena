import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { problemService } from "../services/api";
import Editor from "@monaco-editor/react";
import { Shield, PlusCircle, Trash2, Plus, Terminal, HelpCircle, Code2, AlertTriangle, Loader2 } from "lucide-react";

export const ProblemCreation = ({ onShowToast }) => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    // Form inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [topicsInput, setTopicsInput] = useState("");
    
    // Hints list
    const [hints, setHints] = useState([]);
    const [newHint, setNewHint] = useState("");

    // Visible Test Cases list
    const [visibleTestCases, setVisibleTestCases] = useState([]);
    const [newVisibleInput, setNewVisibleInput] = useState("");
    const [newVisibleOutput, setNewVisibleOutput] = useState("");
    const [newVisibleExplanation, setNewVisibleExplanation] = useState("");

    // Hidden Test Cases list
    const [hiddenTestCases, setHiddenTestCases] = useState([]);
    const [newHiddenInput, setNewHiddenInput] = useState("");
    const [newHiddenOutput, setNewHiddenOutput] = useState("");

    // Code & Solution Tab state
    const [activeLangTab, setActiveLangTab] = useState("javascript");
    const [activeEditorTab, setActiveEditorTab] = useState("soln"); // initialCode or soln
    
    // Starter Codes & Reference Solutions
    const [languageConfigs, setLanguageConfigs] = useState({
        c: {
            initialCode: `#include <stdio.h>\n\nint main(void) {\n    // write your code here\n    return 0;\n}`,
            soln: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello Arena!\\n");\n    return 0;\n}`
        },
        javascript: {
            initialCode: `// write your code here`,
            soln: `function main() {\n    console.log("Hello Arena!");\n}\n\nmain();`
        },
        cpp: {
            initialCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // write your code here\n    return 0;\n}`,
            soln: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello Arena!" << endl;\n    return 0;\n}`
        },
        java: {
            initialCode: `import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\nclass Main\n{\n    public static void main (String[] args) throws java.lang.Exception\n    {\n        // write your code here\n    }\n}`,
            soln: `import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\nclass Main\n{\n    public static void main (String[] args) throws java.lang.Exception\n    {\n        System.out.println("Hello Arena!");\n    }\n}`
        },
        python: {
            initialCode: `# write your code here`,
            soln: `def main():\n    print("Hello Arena!")\n\nif __name__ == "__main__":\n    main()`
        }
    });

    const addHint = () => {
        if (!newHint.trim()) return;
        setHints([...hints, newHint.trim()]);
        setNewHint("");
    };

    const removeHint = (index) => {
        setHints(hints.filter((_, i) => i !== index));
    };

    const addVisibleTestCase = () => {
        if (!newVisibleInput.trim() || !newVisibleOutput.trim()) {
            onShowToast("error", "Input and Output are required for visible test cases");
            return;
        }
        setVisibleTestCases([
            ...visibleTestCases,
            {
                input: newVisibleInput,
                output: newVisibleOutput,
                explanation: newVisibleExplanation
            }
        ]);
        setNewVisibleInput("");
        setNewVisibleOutput("");
        setNewVisibleExplanation("");
    };

    const removeVisibleTestCase = (index) => {
        setVisibleTestCases(visibleTestCases.filter((_, i) => i !== index));
    };

    const addHiddenTestCase = () => {
        if (!newHiddenInput.trim() || !newHiddenOutput.trim()) {
            onShowToast("error", "Input and Output are required for hidden test cases");
            return;
        }
        setHiddenTestCases([
            ...hiddenTestCases,
            {
                input: newHiddenInput,
                output: newHiddenOutput
            }
        ]);
        setNewHiddenInput("");
        setNewHiddenOutput("");
    };

    const removeHiddenTestCase = (index) => {
        setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
    };

    const handleEditorChange = (value) => {
        setLanguageConfigs({
            ...languageConfigs,
            [activeLangTab]: {
                ...languageConfigs[activeLangTab],
                [activeEditorTab]: value || ""
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validations
        if (!title.trim()) {
            onShowToast("error", "Title is required");
            return;
        }
        if (!description.trim()) {
            onShowToast("error", "Description is required");
            return;
        }
        if (visibleTestCases.length === 0) {
            onShowToast("error", "At least one visible test case is required");
            return;
        }
        if (hiddenTestCases.length === 0) {
            onShowToast("error", "At least one hidden testcase is required");
            return;
        }

        setSubmitting(true);
        try {
            // Process topics comma string to array
            const topics = topicsInput
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t !== "");

            // Build request payload matching backend schema
            const refSoln = Object.keys(languageConfigs).map((lang) => ({
                language: lang,
                soln: languageConfigs[lang].soln
            }));

            const startCode = Object.keys(languageConfigs).map((lang) => ({
                language: lang,
                initialCode: languageConfigs[lang].initialCode
            }));

            const problemData = {
                title,
                description,
                difficulty,
                topics,
                hint: hints,
                visibleTestCases,
                hiddenTestCases,
                startCode,
                refSoln
            };

            await problemService.createProblem(problemData);
            onShowToast("success", "Problem created and verified successfully!");
            navigate("/problems");
        } catch (error) {
            onShowToast("error", "Failed to create problem: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-dark-bg text-gray-100">
            {/* Header Title */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex items-center space-x-3 shadow-lg">
                <div className="h-10 w-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Create Challenge</h1>
                    <p className="text-xs sm:text-sm text-gray-400">Design a new coding problem. Reference solutions are compiled against hidden test cases for verification.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: General Configuration */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 shadow-lg">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">General Information</h2>
                        
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="prob-title">Title</label>
                            <input 
                                id="prob-title"
                                type="text"
                                className="w-full px-4 py-2.5 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none transition-colors"
                                placeholder="Two Sum"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="prob-diff">Difficulty</label>
                                <select 
                                    id="prob-diff"
                                    className="w-full px-4 py-2.5 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none transition-colors"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="prob-topics">Topics (Comma separated)</label>
                                <input 
                                    id="prob-topics"
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none transition-colors"
                                    placeholder="Arrays, Hash Table"
                                    value={topicsInput}
                                    onChange={(e) => setTopicsInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="prob-desc">Description</label>
                            <textarea 
                                id="prob-desc"
                                className="w-full h-44 px-4 py-3 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none resize-none transition-colors leading-normal"
                                placeholder="Given an array of integers, return indices of the two numbers such that they add up to a specific target..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Hints Section */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 shadow-lg">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center space-x-1.5">
                            <HelpCircle className="h-4 w-4" />
                            <span>Hints (Optional)</span>
                        </h2>

                        <div className="flex space-x-2">
                            <input 
                                type="text"
                                className="flex-1 px-4 py-2 bg-dark-input border border-dark-border focus:border-primary rounded-lg text-white text-sm focus:outline-none"
                                placeholder="Try using a hashmap..."
                                value={newHint}
                                onChange={(e) => setNewHint(e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={addHint}
                                className="px-4 py-2 bg-dark-hover hover:bg-dark-border border border-dark-border rounded-lg text-white text-sm flex items-center space-x-1 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add</span>
                            </button>
                        </div>

                        {hints.length > 0 && (
                            <div className="space-y-2 pt-2">
                                {hints.map((hintText, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-dark-input border border-dark-border rounded-lg text-xs">
                                        <span className="truncate max-w-[85%] text-gray-300"><span className="font-semibold text-primary mr-1">Hint {index + 1}:</span>{hintText}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeHint(index)} 
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Visible Test Cases */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 shadow-lg">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center space-x-1.5">
                            <Terminal className="h-4 w-4" />
                            <span>Visible Examples</span>
                        </h2>
                        
                        <div className="space-y-3 p-4 bg-dark-input rounded-xl border border-dark-border">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Input</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-1.5 bg-dark-bg border border-dark-border focus:border-primary rounded-lg text-white text-xs focus:outline-none"
                                    placeholder="nums = [2,7,11,15], target = 9"
                                    value={newVisibleInput}
                                    onChange={(e) => setNewVisibleInput(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Output</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-1.5 bg-dark-bg border border-dark-border focus:border-primary rounded-lg text-white text-xs focus:outline-none"
                                    placeholder="[0,1]"
                                    value={newVisibleOutput}
                                    onChange={(e) => setNewVisibleOutput(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Explanation</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-1.5 bg-dark-bg border border-dark-border focus:border-primary rounded-lg text-white text-xs focus:outline-none"
                                    placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                                    value={newVisibleExplanation}
                                    onChange={(e) => setNewVisibleExplanation(e.target.value)}
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={addVisibleTestCase}
                                className="w-full py-2 bg-dark-hover hover:bg-dark-border border border-dark-border rounded-lg text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                            >
                                <PlusCircle className="h-4 w-4 text-primary" />
                                <span>Add Example Case</span>
                            </button>
                        </div>

                        {visibleTestCases.length > 0 && (
                            <div className="space-y-3 pt-2">
                                {visibleTestCases.map((tc, index) => (
                                    <div key={index} className="p-3 bg-dark-input border border-dark-border rounded-xl space-y-1.5 text-xs relative">
                                        <button 
                                            type="button" 
                                            onClick={() => removeVisibleTestCase(index)} 
                                            className="absolute right-3 top-3 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <p className="font-bold text-white">Example Case {index + 1}</p>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 pt-0.5">
                                            <div><span className="text-[10px] text-gray-600 block">Input</span> <pre className="bg-dark-bg p-1 rounded font-mono truncate">{tc.input}</pre></div>
                                            <div><span className="text-[10px] text-gray-600 block">Output</span> <pre className="bg-dark-bg p-1 rounded font-mono truncate">{tc.output}</pre></div>
                                        </div>
                                        {tc.explanation && <p className="text-[10px] text-gray-500 leading-normal pt-1"><span className="text-gray-300 font-semibold">Explanation: </span>{tc.explanation}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Code Config & Hidden Cases */}
                <div className="space-y-6 flex flex-col">
                    {/* Monaco Code Configurations */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex-1 flex flex-col space-y-4 shadow-lg min-h-[480px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center space-x-1.5">
                                <Code2 className="h-4 w-4" />
                                <span>Starter Code & Solutions</span>
                            </h2>
                            <span className="text-[10px] text-gray-500 font-mono">Verified by Judge0</span>
                        </div>

                        {/* Language Selector Tabs */}
                        <div className="flex border-b border-dark-border bg-dark-bg/40 text-xs rounded-lg p-1">
                            {["c", "javascript", "cpp", "java", "python"].map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setActiveLangTab(lang)}
                                    className={`flex-1 py-1.5 rounded-md font-semibold transition-all uppercase ${
                                        activeLangTab === lang ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {lang === "cpp" ? "C++" : lang === "c" ? "C" : lang}
                                </button>
                            ))}
                        </div>

                        {/* Starter Boilerplate vs Complete Solution selector */}
                        <div className="flex border-b border-dark-border text-xs">
                            <button
                                type="button"
                                onClick={() => setActiveEditorTab("soln")}
                                className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                                    activeEditorTab === "soln" ? "border-primary text-white" : "border-transparent text-gray-400 hover:text-white"
                                }`}
                            >
                                Reference Solution (Verification)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveEditorTab("initialCode")}
                                className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                                    activeEditorTab === "initialCode" ? "border-primary text-white" : "border-transparent text-gray-400 hover:text-white"
                                }`}
                            >
                                Starter Boilerplate Template
                            </button>
                        </div>

                        {/* Monaco Editor Container */}
                        <div className="flex-1 relative overflow-hidden bg-[#0e0e11] border border-dark-border rounded-xl min-h-[300px] h-[320px]">
                            <Editor
                                height="100%"
                                language={activeLangTab}
                                theme="vs-dark"
                                value={languageConfigs[activeLangTab][activeEditorTab]}
                                onChange={handleEditorChange}
                                options={{
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollbar: { vertical: 'auto', horizontal: 'auto' },
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>

                    {/* Hidden Test Cases */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 shadow-lg">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center space-x-1.5">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Hidden Verification Cases</span>
                        </h2>

                        <div className="space-y-3 p-4 bg-dark-input rounded-xl border border-dark-border">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Input</label>
                                    <textarea 
                                        className="w-full h-16 px-3 py-1.5 bg-dark-bg border border-dark-border focus:border-primary rounded-lg text-white text-xs focus:outline-none font-mono resize-none"
                                        placeholder="[2,7,11,15]\n9"
                                        value={newHiddenInput}
                                        onChange={(e) => setNewHiddenInput(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Expected Output</label>
                                    <textarea 
                                        className="w-full h-16 px-3 py-1.5 bg-dark-bg border border-dark-border focus:border-primary rounded-lg text-white text-xs focus:outline-none font-mono resize-none"
                                        placeholder="[0,1]"
                                        value={newHiddenOutput}
                                        onChange={(e) => setNewHiddenOutput(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={addHiddenTestCase}
                                className="w-full py-2 bg-dark-hover hover:bg-dark-border border border-dark-border rounded-lg text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                            >
                                <PlusCircle className="h-4 w-4 text-primary" />
                                <span>Add Hidden Case</span>
                            </button>
                        </div>

                        {hiddenTestCases.length > 0 && (
                            <div className="space-y-3 pt-2 max-h-[220px] overflow-y-auto pr-1">
                                {hiddenTestCases.map((tc, index) => (
                                    <div key={index} className="p-3 bg-dark-input border border-dark-border rounded-xl space-y-1 text-xs relative">
                                        <button 
                                            type="button" 
                                            onClick={() => removeHiddenTestCase(index)} 
                                            className="absolute right-3 top-3 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <p className="font-bold text-white">Hidden Case {index + 1}</p>
                                        <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-400 pt-0.5">
                                            <div><span className="text-[10px] text-gray-600 block">Input</span> <pre className="bg-dark-bg p-1 rounded font-mono truncate">{tc.input}</pre></div>
                                            <div><span className="text-[10px] text-gray-600 block">Expected Output</span> <pre className="bg-dark-bg p-1 rounded font-mono truncate">{tc.output}</pre></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Form Actions */}
                    <div className="flex space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate("/profile")}
                            disabled={submitting}
                            className="flex-1 py-3 bg-dark-card hover:bg-dark-hover text-gray-300 font-medium text-sm rounded-lg border border-dark-border transition-colors flex items-center justify-center"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="flex-2 w-2/3 py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-colors duration-200"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Verifying Solutions...</span>
                                </>
                            ) : (
                                <span>Create Challenge</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProblemCreation;
