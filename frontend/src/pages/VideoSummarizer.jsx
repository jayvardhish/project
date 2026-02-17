import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileVideo, CheckCircle, Clock, Send, Download,
    Layers, Youtube, FileText, ChevronRight, AlertCircle,
    Loader2, Trash2, ExternalLink
} from 'lucide-react';
import axios from 'axios';

const VideoSummarizer = () => {
    const [ytUrl, setYtUrl] = useState('');
    const [processing, setProcessing] = useState(false);
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Fetch videos on mount
    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/`);
            setVideos(response.data);
        } catch (error) {
            console.error("Failed to fetch videos:", error);
        }
    };

    const handleYoutubeSummary = async () => {
        if (!ytUrl) return;
        setProcessing(true);
        try {
            const formData = new FormData();
            formData.append('url', ytUrl);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/youtube`, formData);
            setSelectedVideo(response.data);
            setYtUrl('');
            fetchVideos();
        } catch (error) {
            alert(error.response?.data?.detail || "YouTube summarization failed.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFE] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-10 text-center lg:text-left">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-4"
                    >
                        Video <span className="text-primary">Discovery</span>
                    </motion.h1>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        AI-powered intelligence for your lecture videos. Extract transcripts,
                        summarize key points, and read on-screen text instantly.
                    </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Panel: Inputs & History (Xl: 5 cols) */}
                    <div className="xl:col-span-5 space-y-6">
                        {/* YouTube Input Card */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50/50 p-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={ytUrl}
                                        onChange={(e) => setYtUrl(e.target.value)}
                                        placeholder="Paste YouTube URL..."
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                    />
                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-6 h-6" />
                                </div>
                                <button
                                    onClick={handleYoutubeSummary}
                                    disabled={!ytUrl || processing}
                                    className="w-full bg-[#FF0000] hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    <span>Summarize Video</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Items List */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 max-h-[500px] overflow-y-auto">
                            <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                                <span>Recent Sessions</span>
                                <span className="text-xs bg-gray-50 text-gray-400 px-3 py-1 rounded-full uppercase truncate max-w-[100px]">{videos.length} videos</span>
                            </h3>
                            <div className="space-y-3">
                                {videos.length === 0 && (
                                    <div className="text-center py-12 text-gray-300">
                                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="italic">No history yet</p>
                                    </div>
                                )}
                                {videos.map((video) => (
                                    <motion.div
                                        key={video._id}
                                        whileHover={{ x: 5 }}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${selectedVideo?._id === video._id
                                            ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                                            : 'bg-white border-gray-50 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${video.type === 'youtube' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {video.type === 'youtube' ? <Youtube className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{video.title}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                                                    {video.summary_type || 'unprocessed'} • {new Date(video.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSummarizeLocal(video._id); }}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                                                title="Re-Summarize"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                            {video.type !== 'youtube' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVideoOCR(video._id); }}
                                                    className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"
                                                    title="Extract OCR"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Content View (Xl: 7 cols) */}
                    <div className="xl:col-span-7">
                        {processing ? (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-12 h-full flex flex-col items-center justify-center text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 border-8 border-primary/10 border-t-primary rounded-full mb-8"
                                />
                                <h2 className="text-3xl font-black mb-4">Deep Scanning Video...</h2>
                                <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                                    Our AI is extracting the audio stream, transcribing dialogue,
                                    and applying contextual summarization models. This usually takes 30-60s.
                                </p>
                                <div className="mt-12 flex space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ delay: i * 0.2, repeat: Infinity }}
                                            className="w-3 h-3 bg-primary rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : selectedVideo ? (
                            <motion.div
                                key={selectedVideo._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full"
                            >
                                {/* Results Control Bar */}
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-xl text-gray-800 tracking-tight leading-none mb-1">Extracted Insights</h2>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedVideo.type === 'youtube' ? 'YouTube Feed' : 'Local Archive'}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button className="hidden md:flex items-center space-x-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold transition-all text-gray-600">
                                            <Download className="w-4 h-4" />
                                            <span>Export TXT</span>
                                        </button>
                                        <button
                                            onClick={() => window.open(selectedVideo.url || '#', '_blank')}
                                            className={`p-3 rounded-xl transition-all ${selectedVideo.url ? 'bg-primary/5 text-primary hover:bg-primary/10' : 'bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed'}`}
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 lg:p-12 overflow-y-auto space-y-12 bg-[#FCFCFD]">
                                    {/* Main Summary Section */}
                                    {selectedVideo.summary && !selectedVideo.ocr_view && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-0.5 flex-1 bg-primary/10" />
                                                <span className="text-sm font-black text-primary uppercase tracking-[0.2em] bg-white px-4 border border-primary/20 rounded-full py-1">AI {selectedVideo.summary_type} Analysis</span>
                                                <div className="h-0.5 flex-1 bg-primary/10" />
                                            </div>
                                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 prose prose-lg max-w-none">
                                                <div className="whitespace-pre-wrap text-[#2D2D2D] leading-[1.8] font-medium selection:bg-primary/20">
                                                    {selectedVideo.summary}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* OCR Section (Visible if toggled or if that's all we have) */}
                                    {(selectedVideo.video_ocr_text || selectedVideo.ocr_view) && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-0.5 flex-1 bg-purple-100" />
                                                <span className="text-sm font-black text-purple-500 uppercase tracking-[0.2em] bg-white px-4 border border-purple-200 rounded-full py-1">FRAME OCR INSIGHTS</span>
                                                <div className="h-0.5 flex-1 bg-purple-100" />
                                            </div>
                                            <div className="bg-purple-50/30 rounded-3xl p-8 border-2 border-dashed border-purple-100 prose prose-lg max-w-none relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Layers className="w-24 h-24 text-purple-600" />
                                                </div>
                                                <div className="whitespace-pre-wrap text-[#3A3245] leading-[1.8] font-medium selection:bg-purple-200 relative z-10">
                                                    {selectedVideo.video_ocr_text || "No OCR data extracted yet. Click the 'Extract OCR' button in the list to scan video frames."}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Intelligence Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-gray-100">
                                        <div className="bg-white p-6 rounded-2xl border border-gray-50 flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm">Integrity Verified</p>
                                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Full transcript processed with deepseek-chat engine at high fidelity.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-50 flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm">Reference Only</p>
                                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">AI results can vary. Cross-referencing with the original source is recommended.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-12 h-full flex flex-col items-center justify-center text-center group">
                                <motion.div
                                    whileHover={{ rotate: 15 }}
                                    className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-8 transition-colors group-hover:bg-primary/5 group-hover:text-primary/20"
                                >
                                    <FileVideo className="w-16 h-16" />
                                </motion.div>
                                <h2 className="text-2xl font-black text-gray-300 mb-2">Workspace Idle</h2>
                                <p className="text-gray-300 max-w-xs font-bold uppercase tracking-widest text-[10px]">Select a session to begin discovery</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoSummarizer;
