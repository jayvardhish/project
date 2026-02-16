import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Users, Zap, Award, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-white font-body">
            {/* Header / Nav */}
            <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-sm sticky top-0 z-50">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-accent italic">Smart<span className="text-primary">Learn</span></span>
                </Link>
                <Link to="/signup" className="btn-primary">Join Now</Link>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 pb-32 px-8 lg:px-24 overflow-hidden relative">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="glass-pill mx-auto mb-8">Our Mission</div>
                        <h1 className="text-6xl lg:text-8xl font-black text-accent leading-none mb-10">
                            Pioneering the <br />
                            <span className="text-primary italic">Intelligence</span> Epoch.
                        </h1>
                        <p className="text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                            We aren't just building a tool; we're architecting the future of human cognition through multimodal AI integration.
                        </p>
                    </motion.div>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[150px] -z-10"></div>
                <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[150px] -z-10"></div>
            </section>

            {/* Value Pillars */}
            <section className="py-32 px-8 lg:px-24 bg-[#F9FAFB]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: <Target className="w-10 h-10" />, title: "Precision", desc: "Our AI engines are tuned for academic rigor, ensuring every solution and summary meets the highest standards of accuracy." },
                        { icon: <Globe className="w-10 h-10" />, title: "Accessibility", desc: "Breaking down language and format barriers. Learn from video, audio, handwriting, or text—anywhere, anytime." },
                        { icon: <Award className="w-10 h-10" />, title: "Excellence", desc: "We strive to provide a premium experience that empowers every student to achieve their maximum potential." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="glass-card flex flex-col items-center text-center !rounded-[3rem] p-12"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-8 shadow-inner">
                                {item.icon}
                            </div>
                            <h3 className="text-3xl font-black text-accent mb-6 tracking-tight">{item.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-32 px-8 lg:px-24 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                            className="rounded-[3.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                            alt="Team Collaboration"
                        />
                    </div>
                    <div className="lg:w-1/2">
                        <div className="glass-pill mb-10">Human-Centric Design</div>
                        <h2 className="text-5xl lg:text-7xl font-black text-accent mb-8 leading-tight">Empowering the <br /> <span className="text-primary italic">Next Billion</span> Minds.</h2>
                        <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12">
                            SmartLearn was founded on the belief that education is a universal right, and AI is the key to personalizing it at scale. We combine cutting-edge technology with intuitive design to create an experience that feels like magic.
                        </p>
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-4xl font-black text-primary mb-2">1M+</p>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Learners</p>
                            </div>
                            <div className="w-px h-16 bg-gray-200"></div>
                            <div>
                                <p className="text-4xl font-black text-accent mb-2">500TB</p>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Knowledge Processed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 px-8 lg:px-24">
                <div className="purple-gradient rounded-[4rem] p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
                    <h2 className="text-5xl lg:text-7xl font-black mb-10 relative z-10">Ready to Transform?</h2>
                    <p className="text-2xl text-purple-100 font-medium mb-12 max-w-2xl mx-auto relative z-10">
                        Join the elite circle of learners who are already using SmartLearn to stay ahead.
                    </p>
                    <Link to="/signup" className="bg-white text-primary px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl inline-block relative z-10">
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 lg:px-24 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <Zap className="w-6 h-6 text-primary fill-primary" />
                    <span className="text-xl font-black tracking-tight text-accent italic">SmartLearn</span>
                </div>
                <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">© 2026 Intelligence Research Labs. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default About;
