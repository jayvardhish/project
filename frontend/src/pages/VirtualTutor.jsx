import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Trash2, BookOpen } from 'lucide-react';
import axios from 'axios';

const VirtualTutor = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/history`);
            setChat(response.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = { role: 'user', content: message, timestamp: new Date() };
        setChat([...chat, userMsg]);
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/message`, { message });
            setChat(prev => [...prev, { role: 'assistant', content: response.data.reply, timestamp: new Date() }]);
        } catch (error) {
            console.error("Chat failed:", error);
            alert("Failed to get response from tutor.");
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async () => {
        if (!window.confirm('Clear all chat history?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/history`);
            setChat([]);
        } catch (error) {
            console.error("Failed to clear chat:", error);
            alert("Failed to clear chat history.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 purple-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Bot className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-accent">Virtual Study Tutor</h1>
                        <div className="flex items-center text-xs text-green-500 font-bold">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            ONLINE & READY
                        </div>
                    </div>
                </div>
                <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Chat">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {chat.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-primary border border-gray-50">
                            <Sparkles className="w-12 h-12" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-accent mb-2">How can I help you today?</h3>
                            <p className="text-gray-400 max-w-sm">Ask me about complex topics, solve math problems together, or get help with your studies.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                            {["Explain Quantum Physics", "Help me with Calculus", "Summarize History", "Study Tips"].map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setMessage(topic)}
                                    className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium hover:border-primary transition-all text-gray-600 shadow-sm"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {chat.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'ml-3 bg-primary text-white' : 'mr-3 bg-white text-primary border border-gray-100'
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-5 rounded-3xl shadow-sm ${msg.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white text-gray-700 border border-gray-50 rounded-tl-none leading-relaxed'
                                }`}>
                                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center space-x-2 bg-white px-6 py-4 rounded-3xl border border-gray-50 shadow-sm">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto flex items-center space-x-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your question here..."
                            className="w-full px-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all pr-16"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-primary transition-all">
                            <BookOpen className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || loading}
                        className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VirtualTutor;
