import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Video, PenTool, Calculator, MessageSquare, ShieldCheck, Zap, Layers } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-accent italic">Smart<span className="text-primary">Learn</span></span>
                </div>
                <div className="hidden md:flex space-x-10 text-gray-500 font-bold text-sm uppercase tracking-widest">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#about" className="hover:text-primary transition-colors">About</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                </div>
                <div className="flex space-x-4">
                    <Link to="/login" className="px-6 py-2.5 font-bold text-gray-600 hover:text-primary transition-colors">Login</Link>
                    <Link to="/signup" className="btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 px-8 lg:px-24">
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-purple-50 to-transparent"></div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 text-center lg:text-left"
                    >
                        <div className="glass-pill mb-6 w-fit mx-auto lg:mx-0">Next-Gen AI Learning</div>
                        <h1 className="text-6xl lg:text-8xl font-black text-accent leading-[0.9] mb-8">
                            Master Your <br />
                            <span className="text-primary text-glow italic">Knowledge</span> <br />
                            Instantly.
                        </h1>
                        <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed">
                            The world's most advanced multimodal learning engine. Transcribe lectures, solve equations, and generate quizzes in seconds—all powered by state-of-the-art AI.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <Link to="/signup" className="btn-primary px-10 py-5 text-lg group">
                                Start Learning Free
                                <Zap className="ml-3 w-5 h-5 group-hover:scale-125 transition-transform" />
                            </Link>
                            <button className="btn-secondary px-10 py-5 text-lg">
                                Watch Masterclass
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative z-10 animate-float">
                            <div className="glass-card p-4 overflow-hidden shadow-purple-900/10">
                                <img
                                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                                    alt="Advanced Learning Interface"
                                    className="rounded-[2rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>

                            {/* Floating Stats Card */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -bottom-10 -right-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden lg:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Verified</p>
                                        <p className="text-xl font-black text-accent">99.9% Accuracy</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Background Blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px]"></div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-8 lg:px-24 bg-[#FAFBFF]">
                <div className="text-center mb-24">
                    <div className="glass-pill mx-auto mb-6">Cutting-Edge Features</div>
                    <h2 className="text-5xl lg:text-7xl font-black text-accent mb-6">Designed for <span className="text-primary italic">Excellence</span></h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">Everything you need to optimize your learning workflow, built with a focus on speed, precision, and elegance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { icon: <Video />, title: "Video Summarizer", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f", color: "blue", desc: "Transcribe any video lecture into professional notes instantly." },
                        { icon: <BookOpen />, title: "Quiz Generator", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d", color: "purple", desc: "Convert PDFs and notes into intelligent, personalized quizzes." },
                        { icon: <Calculator />, title: "Math Solver", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb", color: "indigo", desc: "Complex equations solved step-by-step with high-fidelity LaTeX." },
                        { icon: <PenTool />, title: "Essay Grader", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a", color: "rose", desc: "Professional AI feedback to elevate your writing style and structure." },
                        { icon: <MessageSquare />, title: "Virtual Tutor", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998", color: "cyan", desc: "A world-class academic assistant available 24/7 for any subject." },
                        { icon: <Layers />, title: "Learning Paths", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4", color: "amber", desc: "Adaptive curricula that evolve based on your individual progress." },
                        { icon: <Zap />, title: "Handwriting OCR", image: "https://images.unsplash.com/photo-1517842645767-c639042777db", color: "violet", desc: "Snap a photo of your handwritten notes and digitize them in 4K." },
                        { icon: <ShieldCheck />, title: "Plagiarism Check", image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d", color: "emerald", desc: "Ensure total academic integrity with deep semantic scanning." }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -12 }}
                            className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-primary/10 transition-all group"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img src={feature.image + "?auto=format&fit=crop&w=600&q=75"} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/30">
                                    {feature.icon}
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black mb-4 text-accent">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
