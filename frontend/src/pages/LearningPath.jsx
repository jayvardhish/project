import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Map, Compass, Target, CheckCircle, Flag, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

const LearningPath = () => {
    const [loading, setLoading] = useState(false);
    const [path, setPath] = useState(null);
    const [category, setCategory] = useState("General Knowledge");
    const categories = ["Exam", "Job", "Research", "General Knowledge"];

    useEffect(() => {
        fetchPath();
    }, [category]);

    const fetchPath = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/learning-path/generate?category=${encodeURIComponent(category)}`);
            setPath(response.data);
        } catch (error) {
            console.error("Path fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-4xl font-bold text-accent mb-4">Your Learning Roadmap</h1>
                    <p className="text-gray-500">A personalized curriculum generated from your recent performance and interests.</p>
                </div>
                <button
                    onClick={fetchPath}
                    className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-primary transition-all text-sm font-bold text-accent shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
                    <span>Regenerate Path</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-12">
                {categories.map(c => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${category === c ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h3 className="text-2xl font-bold text-accent">Charting Your Course...</h3>
                    <p className="text-gray-400">Our AI is analyzing your progress to suggest the next best steps.</p>
                </div>
            ) : path ? (
                <div className="relative space-y-12">
                    {/* Vertical line connector */}
                    <div className="absolute left-10 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-purple-300 to-transparent opacity-20 hidden md:block" />

                    {path.phases.map((phase, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col md:flex-row items-center w-full ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                        >
                            <div className="md:w-5/12 w-full">
                                <div className={`p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                    <div className={`w-14 h-14 bg-secondary/30 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm ${idx % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-accent mb-2">{phase.title}</h3>
                                    <p className="text-primary font-bold text-sm mb-6 flex items-center justify-start md:justify-end">
                                        {idx % 2 === 0 ? '' : <Flag className="w-4 h-4 mr-2" />}
                                        {phase.goal}
                                        {idx % 2 === 0 ? <Flag className="w-4 h-4 ml-2" /> : ''}
                                    </p>

                                    <div className="space-y-4">
                                        {phase.tasks.map((task, tIdx) => (
                                            <div key={tIdx} className={`flex items-center space-x-3 text-sm text-gray-600 ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                                {idx % 2 === 0 ? <span className="text-right">{task}</span> : ''}
                                                <div className="w-2 h-2 bg-purple-200 rounded-full flex-shrink-0"></div>
                                                {idx % 2 === 0 ? '' : <span className="text-left">{task}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Center point */}
                            <div className="w-full md:w-2/12 flex justify-center py-8 md:py-0 relative z-10">
                                <div className="w-12 h-12 bg-white border-4 border-primary rounded-full flex items-center justify-center font-bold text-primary shadow-lg ring-8 ring-purple-50">
                                    {idx + 1}
                                </div>
                            </div>

                            <div className="md:w-5/12 hidden md:block"></div>
                        </motion.div>
                    ))}

                    <div className="flex justify-center pt-12">
                        <div className="bg-primary text-white p-8 rounded-[3rem] text-center max-w-sm shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <Zap className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="text-2xl font-bold mb-2">Final Objective</h4>
                                <p className="text-purple-100 text-sm mb-6">Complete all phases to achieve mastery in your chosen domains.</p>
                                <ArrowRight className="w-6 h-6 mx-auto" />
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center">
                    <Compass className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-400">No roadmap found</h3>
                    <button onClick={fetchPath} className="mt-6 text-primary font-bold hover:underline">Click to generate your first path</button>
                </div>
            )}
        </div>
    );
};

export default LearningPath;
