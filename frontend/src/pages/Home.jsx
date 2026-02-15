import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Video, PenTool, Calculator, MessageSquare, ShieldCheck, Zap, Layers } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-sm sticky top-0 z-50">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">SM</div>
                    <span className="text-2xl font-bold tracking-tight text-accent">SmartLearn</span>
                </div>
                <div className="hidden md:flex space-x-8 text-accent font-medium">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#about" className="hover:text-primary transition-colors">About</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                </div>
                <div className="flex space-x-4">
                    <Link to="/login" className="px-6 py-2 font-semibold text-primary hover:text-primary-light transition-colors">Login</Link>
                    <Link to="/signup" className="btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="purple-gradient text-white py-24 px-8 md:px-24 flex flex-col md:flex-row items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2"
                >
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        Unlock Your <br /> Potential with <br /> <span className="text-secondary">AI-Powered</span> Learning
                    </h1>
                    <p className="text-xl text-purple-100 mb-10 max-w-lg">
                        A multimodal platform designed to transform how you study. Summarize lectures, solve math problems, and learn at your own pace.
                    </p>
                    <div className="flex space-x-4">
                        <Link to="/signup" className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-all shadow-lg flex items-center">
                            Try it for Free <Zap className="ml-2 w-5 h-5 fill-primary" />
                        </Link>
                        <button className="border-2 border-white/30 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 mt-16 md:mt-0 flex justify-center"
                >
                    <div className="relative">
                        <div className="w-80 h-80 md:w-96 md:h-96 bg-white/10 rounded-full absolute -top-10 -left-10 animate-pulse"></div>
                        <div className="glass-card w-full max-w-md relative z-10 border-white/20">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                                alt="Student learning"
                                className="rounded-xl shadow-2xl mb-6 grayscale hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="flex items-center space-x-3 bg-white/90 p-3 rounded-lg text-primary shadow-lg -mt-10 ml-6 w-fit relative z-20">
                                <ShieldCheck className="w-6 h-6" />
                                <span className="font-bold">AI Verified Solutions</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-8 md:px-24">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-accent mb-4">Powerful Features for Modern Students</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to excel in your academic journey, powered by state-of-the-art AI.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <Video />, title: "Video Summarizer", desc: "Transcribe and summarize lectures automatically." },
                        { icon: <BookOpen />, title: "Quiz Generator", desc: "Turn any document into a personalized quiz." },
                        { icon: <Calculator />, title: "Math Solver", desc: "Get step-by-step solutions for complex equations." },
                        { icon: <PenTool />, title: "Essay Grader", desc: "Get detailed AI feedback on your writing." },
                        { icon: <MessageSquare />, title: "Virtual Tutor", desc: "24/7 assistance with any subject-related question." },
                        { icon: <Layers />, title: "Learning Paths", desc: "Custom curricula tailored to your progress." },
                        { icon: <Zap />, title: "Handwriting OCR", desc: "Convert handwritten notes into digital text." },
                        { icon: <ShieldCheck />, title: "Plagiarism Check", desc: "Ensure your work is original and cited." }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="p-8 border border-gray-100 rounded-2xl hover:border-primary-light hover:shadow-xl transition-all group"
                        >
                            <div className="w-12 h-12 bg-secondary/30 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-500">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
