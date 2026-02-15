import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Copy, Check, Download,
    Image as ImageIcon, Zap, History, X,
    Trash2, RefreshCw, Layers, ExternalLink, ScrollText
} from 'lucide-react';
import axios from 'axios';

const HandwritingRecognition = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ocrMode, setOcrMode] = useState('default');
    const [history, setHistory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ocr/history`);
            setHistory(response.data);
            if (response.data.length > 0 && !selectedItem) {
                setSelectedItem(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch OCR history:", error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', ocrMode);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ocr/upload`, formData);
            const newItem = {
                _id: response.data.id,
                title: file.name,
                text: response.data.text,
                mode: response.data.mode,
                created_at: new Date().toISOString()
            };
            setHistory([newItem, ...history]);
            setSelectedItem(newItem);
            setFile(null);
            setPreview(null);
        } catch (error) {
            alert("Handwriting conversion failed. Ensure you're uploaded a clear image.");
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/ocr/${id}`);
            const newHistory = history.filter(item => item._id !== id);
            setHistory(newHistory);
            if (selectedItem?._id === id) {
                setSelectedItem(newHistory[0] || null);
            }
        } catch (error) {
            alert("Failed to delete record.");
        }
    };

    const copyToClipboard = () => {
        if (!selectedItem?.text) return;
        navigator.clipboard.writeText(selectedItem.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#F9FBFF] flex flex-col lg:flex-row">
            {/* Sidebar: OCR History */}
            <aside className="w-full lg:w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <History className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-black text-gray-800 tracking-tight">Scan Archive</h2>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digitized handwritten notes</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ScrollText className="w-12 h-12 text-gray-100 mb-4" />
                            <p className="text-sm text-gray-300 font-medium italic">No notes digitized yet</p>
                        </div>
                    )}
                    {history.map((item) => (
                        <motion.button
                            key={item._id}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between group ${selectedItem?._id === item._id
                                    ? 'bg-purple-50 border-purple-100 ring-1 ring-purple-100'
                                    : 'bg-white border-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="min-w-0 pr-4">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.title || "Untitled Scan"}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1 flex items-center">
                                    <Layers className="w-3 h-3 mr-1" />
                                    {item.mode} • {new Date(item.created_at).toLocaleDateString()}
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
                <header className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center"
                    >
                        Ink <span className="text-purple-600 ml-3">Transcriber</span>
                    </motion.h1>
                    <p className="text-gray-500 mt-2 font-medium text-lg">Convert messy ink into professional digital documents.</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Input Column */}
                    <div className="xl:col-span-5 space-y-8">
                        {/* Upload Card */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-purple-900/5 p-8">
                            <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group hover:border-purple-300 transition-colors bg-gray-50/30">
                                {preview ? (
                                    <div className="relative group">
                                        <img src={preview} alt="Scan preview" className="max-h-[250px] rounded-2xl shadow-2xl border-4 border-white mb-4" />
                                        <button
                                            onClick={() => { setFile(null); setPreview(null); }}
                                            className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-purple-400 transition-all">
                                            <ImageIcon className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-400 mb-6 tracking-tight">Snap or Drop Notes</h3>
                                    </>
                                )}
                                <input type="file" id="ocr-img" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <label
                                    htmlFor="ocr-img"
                                    className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl cursor-pointer transition-all border border-gray-100 shadow-sm"
                                >
                                    {file ? "Change Image" : "Choose File"}
                                </label>
                            </div>

                            {/* Mode Picker */}
                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Transcription Mode</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {['default', 'structured', 'clean'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setOcrMode(mode)}
                                            className={`py-3 rounded-xl text-xs font-bold capitalize transition-all border-2 ${ocrMode === mode
                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100'
                                                    : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleProcess}
                                disabled={!file || loading}
                                className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-purple-100 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                                <span>Analyze Handwriting</span>
                            </button>
                        </div>
                    </div>

                    {/* Result Column */}
                    <div className="xl:col-span-7">
                        {loading ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-16 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-24 h-24 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-10"
                                >
                                    <ScrollText className="w-12 h-12" />
                                </motion.div>
                                <h2 className="text-3xl font-black mb-4">Neural Scanning...</h2>
                                <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                                    Decoding ink patterns and reconstructuring semantic layout using DeepSeek Vision logic.
                                </p>
                                <div className="mt-12 flex space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ scale: [1, 1.4, 1] }}
                                            transition={{ delay: i * 0.2, repeat: Infinity }}
                                            className="w-3 h-3 bg-purple-600 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : selectedItem ? (
                            <motion.div
                                key={selectedItem._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]"
                            >
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-xl text-gray-800 tracking-tight leading-none mb-1">Digitized Notes</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedItem.mode} Conversion</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-3 bg-gray-50 hover:bg-white border hover:border-purple-200 rounded-xl transition-all text-gray-500 flex items-center space-x-2 group"
                                        >
                                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 group-hover:text-purple-600" />}
                                            <span className={`text-xs font-bold ${copied ? 'text-green-500' : ''}`}>{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                        <button className="hidden sm:flex items-center space-x-2 px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl font-bold transition-all border border-purple-100">
                                            <Download className="w-4 h-4" />
                                            <span>Export TXT</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-10 lg:p-14 overflow-y-auto bg-[#FCFCFD] flex-1">
                                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative group min-h-[400px]">
                                        <div className="absolute top-8 left-8 opacity-5">
                                            <ScrollText className="w-32 h-32 text-purple-900" />
                                        </div>
                                        <div className="relative z-10 whitespace-pre-wrap text-lg font-medium text-gray-700 leading-relaxed selection:bg-purple-100">
                                            {selectedItem.text}
                                        </div>
                                    </div>

                                    {/* Intelligence Summary */}
                                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-gray-100">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800">Layout Verified</p>
                                                <p className="text-xs text-gray-400 mt-1">Spatial intelligence applied to reconstruct structure from handwritten inputs.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                <ExternalLink className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800">Dynamic Scaling</p>
                                                <p className="text-xs text-gray-400 mt-1">Scalable for long legal pads or quick sticky notes.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center text-center group h-full">
                                <motion.div
                                    whileHover={{ y: -10, rotate: 5 }}
                                    className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mb-10 group-hover:bg-purple-50 group-hover:text-purple-300 transition-all"
                                >
                                    <ImageIcon className="w-16 h-16" />
                                </motion.div>
                                <h2 className="text-2xl font-black text-gray-300 tracking-tight mb-2">Workspace Quiet</h2>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Select a scan to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HandwritingRecognition;
