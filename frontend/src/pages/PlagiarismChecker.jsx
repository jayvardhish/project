import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, AlertTriangle, FileText, CheckCircle, Info, BarChart } from 'lucide-react';
import axios from 'axios';

const PlagiarismChecker = () => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    const handleCheck = async () => {
        if (!content.trim()) return;
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/plagiarism/check`, { content });
            setReport(response.data);
        } catch (error) {
            console.error("Plagiarism check failed:", error);
            alert("Failed to analyze content.");
        } finally {
            setLoading(false);
        }
    };

    const ScoreGauge = ({ label, score, color }) => (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                    <motion.circle
                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={364}
                        initial={{ strokeDashoffset: 364 }}
                        animate={{ strokeDashoffset: 364 - (364 * score / 100) }}
                        className={color}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-accent">{score}%</span>
                </div>
            </div>
            <span className="mt-4 font-bold text-gray-500 uppercase text-xs tracking-widest">{label}</span>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-accent mb-4">Plagiarism & AI Detector</h1>
                <p className="text-gray-500">Ensure the originality of your work and detect AI-generated content patterns instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input area */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste the text you want to check for plagiarism or AI patterns..."
                            className="w-full h-[400px] p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none resize-none transition-all text-gray-700 leading-relaxed"
                        />
                        <div className="flex items-center justify-between mt-6">
                            <span className="text-xs text-gray-400 font-medium">{content.split(/\s+/).filter(x => x).length} words</span>
                            <button
                                onClick={handleCheck}
                                disabled={loading || !content.trim()}
                                className="btn-primary px-10 py-3 flex items-center shadow-lg disabled:opacity-50"
                            >
                                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Scanning...</> : <><Search className="w-5 h-5 mr-2" /> Start Scan</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results area */}
                <div className="space-y-8">
                    {report ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm grid grid-cols-2 gap-8">
                                <ScoreGauge label="Similarity" score={report.similarity_score} color="text-red-500" />
                                <ScoreGauge label="AI Probability" score={report.ai_probability} color="text-purple-500" />
                            </div>

                            <div className={`p-6 rounded-2xl border flex items-start space-x-4 ${report.status === 'safe' ? 'bg-green-50 border-green-100 text-green-700' :
                                    report.status === 'caution' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                                        'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                {report.status === 'safe' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <ShieldCheck className="w-6 h-6 flex-shrink-0" />}
                                <div>
                                    <h4 className="font-bold text-lg capitalize">System Rating: {report.status}</h4>
                                    <p className="text-sm opacity-80 mt-1">{report.detailed_report}</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                <h4 className="font-bold text-accent mb-6 flex items-center">
                                    <BarChart className="w-5 h-5 mr-3 text-primary" /> Analysis Findings
                                </h4>
                                <div className="space-y-4">
                                    {report.findings.map((finding, idx) => (
                                        <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
                                            <p className="text-sm text-gray-700 font-medium">{finding}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[500px] bg-gray-50 border border-gray-100 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-12">
                            <ShieldCheck className="w-16 h-16 text-gray-200 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-400">Scan Results Ready</h3>
                            <p className="text-gray-400 max-w-xs mt-2">Paste or upload content to see similarity reports and AI detection metrics.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlagiarismChecker;
