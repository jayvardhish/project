import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Zap, Upload, ImageIcon, Calculator, RefreshCw,
    FileText, CheckCircle2, ChevronRight, Download, Copy,
    Trash2, Lightbulb, History, Send, X, Terminal, Brain
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MathSolver = () => {
    console.log("MathSolver component initializing...");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [expression, setExpression] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeInput, setActiveInput] = useState('text'); // 'text' or 'image'

    useEffect(() => {
        console.log("MathSolver: Fetching history...");
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/math/history`);
            setHistory(response.data);
            if (response.data.length > 0 && !selectedItem) {
                setSelectedItem(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch math history:", error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setActiveInput('image');
        }
    };

    const handleSolveText = async () => {
        if (!expression.trim()) return;
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/math/solve-text`, { expression });
            const newItem = {
                _id: response.data.id,
                expression,
                solution: response.data.solution,
                type: 'text',
                created_at: new Date().toISOString()
            };
            setHistory([newItem, ...history]);
            setSelectedItem(newItem);
            setExpression("");
        } catch (error) {
            alert("Failed to solve manual input.");
        } finally {
            setLoading(false);
        }
    };

    const handleSolveImage = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/math/solve`, formData);
            const newItem = {
                _id: response.data.id,
                expression: response.data.expression,
                solution: response.data.solution,
                type: 'image',
                created_at: new Date().toISOString()
            };
            setHistory([newItem, ...history]);
            setSelectedItem(newItem);
            setFile(null);
            setPreview(null);
        } catch (error) {
            alert("Failed to analyze image.");
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/math/${id}`);
            const newHistory = history.filter(item => item._id !== id);
            setHistory(newHistory);
            if (selectedItem?._id === id) {
                setSelectedItem(newHistory[0] || null);
            }
        } catch (error) {
            alert("Failed to delete item.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FD] flex flex-col lg:flex-row">
            {/* Sidebar: History */}
            <aside className="w-full lg:w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                            <History className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-black text-gray-800 tracking-tight">Solving Archive</h2>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your mathematical journey</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Brain className="w-12 h-12 text-gray-100 mb-4" />
                            <p className="text-sm text-gray-300 font-medium italic">No problems solved yet</p>
                        </div>
                    )}
                    {history.map((item) => (
                        <motion.button
                            key={item._id}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between group ${selectedItem?._id === item._id
                                ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                                : 'bg-white border-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="min-w-0 pr-4">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.expression}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1 flex items-center">
                                    {item.type === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Terminal className="w-3 h-3 mr-1" />}
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteItem(item._id); }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </motion.button>
                    ))}
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col p-4 lg:p-10 max-w-7xl mx-auto w-full">
                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight"
                        >
                            Pro <span className="text-primary italic">Math</span> Solver
                        </motion.h1>
                        <p className="text-gray-500 mt-2 font-medium">Capture or type your problem for instant, deep explanations.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 items-start">
                    {/* Input Cards (Left) */}
                    <div className="xl:col-span-5 space-y-6">
                        {/* Selector Tabs */}
                        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex">
                            <button
                                onClick={() => setActiveInput('text')}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${activeInput === 'text' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <Terminal className="w-4 h-4" />
                                <span>Text Input</span>
                            </button>
                            <button
                                onClick={() => setActiveInput('image')}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${activeInput === 'image' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                <span>Camera / File</span>
                            </button>
                        </div>

                        {/* Text Card */}
                        <AnimatePresence mode="wait">
                            {activeInput === 'text' ? (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 space-y-6"
                                >
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                                            <Calculator className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-800">Problem Editor</h3>
                                    </div>
                                    <textarea
                                        value={expression}
                                        onChange={(e) => setExpression(e.target.value)}
                                        placeholder="Enter equation (e.g. Solve 3x + 4 = 19 or Integration of x*sin(x)...)"
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-primary focus:bg-white outline-none transition-all font-mono text-gray-700 min-h-[160px] resize-none"
                                    />
                                    <button
                                        onClick={handleSolveText}
                                        disabled={!expression.trim() || loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-[1.5rem] font-black shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                        <span>Synthesize Solution</span>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="image"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 space-y-6"
                                >
                                    <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-colors">
                                        {preview ? (
                                            <div className="relative group">
                                                <img src={preview} alt="Preview" className="max-h-[220px] rounded-2xl shadow-xl border border-white mb-4" />
                                                <button onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-primary/5 text-primary/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:text-primary/60 transition-all">
                                                    <Upload className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-400 mb-8">Drop Photo Here</h3>
                                            </>
                                        )}
                                        <input type="file" id="math-img" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        <label
                                            htmlFor="math-img"
                                            className="px-10 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl cursor-pointer transition-all border border-gray-100"
                                        >
                                            {file ? "Replace Image" : "Select from Files"}
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleSolveImage}
                                        disabled={!file || loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-[1.5rem] font-black shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                                        <span>Extract & Solve</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Sidebar (Right) */}
                    <div className="xl:col-span-7">
                        {loading ? (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-16 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 90, 180, 270, 360]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mb-10"
                                >
                                    <Calculator className="w-12 h-12" />
                                </motion.div>
                                <h2 className="text-3xl font-black mb-4">Thinking Step-by-Step...</h2>
                                <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                                    Our AI mathematician is decomposing the expression and validating
                                    each proof step for accuracy.
                                </p>
                                <div className="mt-12 space-y-3 w-48">
                                    <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: [-200, 200] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="h-full w-1/3 bg-primary"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">AI Validation Active</p>
                                </div>
                            </div>
                        ) : selectedItem ? (
                            <motion.div
                                key={selectedItem._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden flex flex-col min-h-[600px]"
                            >
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white relative z-10">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-xl text-gray-800 tracking-tight leading-none mb-1">Detailed Solution</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedItem.type === 'image' ? 'Handwritten Scan' : 'Text Input'}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(selectedItem.solution)}
                                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button className="hidden sm:flex items-center space-x-2 px-6 py-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl font-bold transition-all">
                                            <Download className="w-4 h-4" />
                                            <span>Export PDF</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 lg:p-12 overflow-y-auto space-y-12 bg-[#FCFCFD] flex-1">
                                    {/* Problem Header */}
                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <Calculator className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Original Problem</div>
                                            <div className="text-2xl font-black text-gray-800 selection:bg-primary/10">
                                                {selectedItem.expression}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Solution Content */}
                                    <div className="space-y-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-0.5 flex-1 bg-gray-100" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI PROOF ENGINE</span>
                                            <div className="h-0.5 flex-1 bg-gray-100" />
                                        </div>

                                        <div className="prose prose-lg prose-slate max-w-none selection:bg-secondary min-h-[400px]">
                                            <div className="math-container">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    className="math-markdown"
                                                    components={{
                                                        p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
                                                        li: ({ children }) => <li className="mb-2 text-gray-700">{children}</li>
                                                    }}
                                                >
                                                    {selectedItem.solution}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pro Features Footer */}
                                    <div className="pt-12 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-50 flex items-start space-x-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-gray-800">Verified Step-by-Step</p>
                                                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Each line checked for mathematical validity by GPT-4 and DeepSeek-V3.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-gray-50 flex items-start space-x-3">
                                            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-gray-800">Tutor Insight</p>
                                                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Explanations refined for clarity and simplified conceptual understanding.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center text-center group h-full">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -10 }}
                                    className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-10 group-hover:bg-primary/5 group-hover:text-primary transition-all"
                                >
                                    <Calculator className="w-16 h-16" />
                                </motion.div>
                                <h2 className="text-2xl font-black text-gray-300 tracking-tight mb-2">Workspace Quiet</h2>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Ready to analyze your problems</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MathSolver;
