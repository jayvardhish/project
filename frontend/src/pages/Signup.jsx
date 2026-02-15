import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Github, Chrome } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const schema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Signup = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema)
    });



    const onSubmit = async (data) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, data);
            alert("Account created successfully! Please log in.");
            navigate('/login');
        } catch (error) {
            console.error("Signup failed:", error);
            const errorMessage = error.response?.data?.detail || error.message || "Signup failed. Please try again.";
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-body">
            {/* Left Panel - Decorative (Same as Login) */}
            <div className="hidden lg:flex w-1/2 purple-gradient p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center space-x-2 w-fit mb-12">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">SM</div>
                        <span className="text-2xl font-bold tracking-tight">SmartLearn</span>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-bold mb-6">Join the Future <br /> of Learning</h1>
                        <p className="text-xl text-purple-100 max-w-md">
                            Create an account to start your personalized AI-powered educational journey today.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10">
                    <p className="text-purple-200">© 2026 Smart Multimodal Learning Platform. All rights reserved.</p>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-1/3 -right-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center space-x-2 mb-12">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">SM</div>
                        <span className="text-xl font-bold tracking-tight text-accent">SmartLearn</span>
                    </div>

                    <h2 className="text-3xl font-bold text-accent mb-2">Create Account</h2>
                    <p className="text-gray-500 mb-8">Join thousands of students learning smarter with AI.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('username')}
                                    type="text"
                                    placeholder="John Doe"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.username ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-70"
                        >
                            {isSubmitting ? "Creating Account..." : (
                                <>Sign Up <UserPlus className="ml-2 w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100"></span>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400">Or sign up with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <a
                            href={`${import.meta.env.VITE_API_URL}/api/auth/google/login`}

                            className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        >
                            <Chrome className="w-5 h-5 mr-2" /> Google
                        </a>
                        <a
                            href={`${import.meta.env.VITE_API_URL}/api/auth/github/login`}

                            className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        >
                            <Github className="w-5 h-5 mr-2" /> GitHub
                        </a>
                    </div>

                    <p className="mt-10 text-center text-gray-500">
                        Already have an account? <Link to="/login" className="text-primary font-bold hover:text-primary-light">Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
