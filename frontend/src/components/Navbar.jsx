import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Video, BookOpen, MessageSquare, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-8">
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">SM</div>
                    <span className="text-xl font-bold tracking-tight text-accent">SmartLearn</span>
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-primary transition-colors font-medium">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Link>
                    <Link to="/features/video-summarizer" className="flex items-center text-gray-600 hover:text-primary transition-colors font-medium">
                        <Video className="w-4 h-4 mr-2" /> Summarizer
                    </Link>
                    <Link to="/features/quiz-generator" className="flex items-center text-gray-600 hover:text-primary transition-colors font-medium">
                        <BookOpen className="w-4 h-4 mr-2" /> Quizzes
                    </Link>
                    <Link to="/features/virtual-tutor" className="flex items-center text-gray-600 hover:text-primary transition-colors font-medium">
                        <MessageSquare className="w-4 h-4 mr-2" /> Tutor
                    </Link>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-6 h-6 bg-secondary text-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-accent">{user?.username}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
