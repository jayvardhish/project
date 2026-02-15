import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Send, CheckCircle, AlertCircle, FileText, ChevronRight, Star } from 'lucide-react';
import axios from 'axios';

const EssayGrader = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleGrade = async () => {
        if (!title || !content) return alert("Please provide both a title and content.");
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/essays/submit`, { title, content });
            setResult(response.data.grade);
        } catch (error) {
            console.error("Grading failed:", error);
            alert("Failed to grade essay.");
        } finally {
            setLoading(false);
        }
    };

    const ScoreBar = ({ label, score, color }) => (
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-700">{label}</span>
                <span className={`font-bold ${color}`}>{score}/10</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 10}%` }}
                    className={`h-full bg-current ${color}`}
                />
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-12 text-center lg:text-left">
                <h1 className="text-4xl font-bold text-accent mb-4">Academic Essay Grader</h1>
                <p className="text-gray-500 max-w-2xl">Submit your writing for an instant, detailed audit on grammar, structure, and original content quality.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Input Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Essay Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter the title of your essay..."
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Essay Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste your essay content here (min. 100 words recommended)..."
                                className="w-full h-96 px-6 py-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none resize-none transition-all text-gray-700 leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={handleGrade}
                            disabled={loading || !content}
                            className="w-full btn-primary mt-8 py-4 text-xl flex items-center justify-center disabled:opacity-50 shadow-lg"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div> Grading Your Work...</>
                            ) : (
                                <><CheckCircle className="w-6 h-6 mr-3" /> Analyze Essay</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-1">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm sticky top-24"
                        >
                            <div className="text-center mb-10 pb-8 border-b border-gray-50">
                                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 border-8 border-secondary/30 shadow-xl">
                                    {result.overall_score}
                                </div>
                                <h3 className="text-2xl font-bold text-accent">Overall Grade</h3>
                            </div>

                            <div className="space-y-2">
                                <ScoreBar label="Grammar & Mechanics" score={result.grammar_score} color="text-blue-500" />
                                <ScoreBar label="Structure & Flow" score={result.structure_score} color="text-purple-500" />
                                <ScoreBar label="Content & Argument" score={result.content_score} color="text-pink-500" />
                            </div>

                            <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 className="font-bold flex items-center text-accent mb-4">
                                    <AlertCircle className="w-5 h-5 mr-3 text-red-500" /> Improvement Areas
                                </h4>
                                <ul className="space-y-4">
                                    {result.suggestions.map((s, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600">
                                            <ChevronRight className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 p-6 bg-secondary/10 rounded-2xl border border-primary-light/20">
                                <h4 className="font-bold flex items-center text-primary mb-3">
                                    <Star className="w-5 h-5 mr-3" /> Teacher's Notes
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                    "{result.feedback}"
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                            <FileText className="w-16 h-16 text-gray-200 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-300">Awaiting Analysis</h3>
                            <p className="text-gray-400 mt-2">Submit your essay to receive a detailed performance breakdown.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EssayGrader;
