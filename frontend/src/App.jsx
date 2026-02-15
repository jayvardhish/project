import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VideoSummarizer from './pages/VideoSummarizer';
import QuizGenerator from './pages/QuizGenerator';
import HandwritingRecognition from './pages/HandwritingRecognition';
import MathSolver from './pages/MathSolver';
import EssayGrader from './pages/EssayGrader';
import VirtualTutor from './pages/VirtualTutor';
import PlagiarismChecker from './pages/PlagiarismChecker';
import LearningPath from './pages/LearningPath';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Video, BookOpen, MessageSquare, PenTool, Calculator, MessageCircle, FileText, Layers, Bot, ShieldAlert, Map } from 'lucide-react';

// Basic components (to be created)
const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-accent">Welcome, {user?.username}!</h1>
      <p className="mt-4 text-gray-600">You are successfully logged in to your SmartLearn dashboard.</p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/features/video-summarizer" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Video Summarizer</h3>
          <p className="text-gray-500">Transcribe and summarize your lecture videos into key points.</p>
        </Link>
        <Link to="/features/quiz-generator" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Quiz Generator</h3>
          <p className="text-gray-500">Transform any document or text into an interactive quiz.</p>
        </Link>
        <Link to="/features/handwriting-recognition" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <PenTool className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Handwriting OCR</h3>
          <p className="text-gray-500">Convert handwritten notes into digital, editable text.</p>
        </Link>
        <Link to="/features/math-solver" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Math Solver</h3>
          <p className="text-gray-500">Get step-by-step solutions for photographed math problems.</p>
        </Link>
        <Link to="/features/essay-grader" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Essay Grader</h3>
          <p className="text-gray-500">Get clinical AI feedback and academic scores for your essays.</p>
        </Link>
        <Link to="/features/virtual-tutor" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Virtual Tutor</h3>
          <p className="text-gray-500">24/7 real-time assistance with your academic questions.</p>
        </Link>
        <Link to="/features/plagiarism-checker" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Plagiarism Checker</h3>
          <p className="text-gray-500">Scan for duplication and analyze content for AI generation.</p>
        </Link>
        <Link to="/features/learning-path" className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Learning Path</h3>
          <p className="text-gray-500">Get a personalized AI-generated roadmap for your studies.</p>
        </Link>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center purple-gradient text-white">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-lg">Loading your profile...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="bg-white m-4 rounded-3xl shadow-lg min-h-[calc(100vh-120px)] border border-gray-100 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/features/video-summarizer" element={
            <ProtectedRoute>
              <VideoSummarizer />
            </ProtectedRoute>
          } />

          <Route path="/features/quiz-generator" element={
            <ProtectedRoute>
              <QuizGenerator />
            </ProtectedRoute>
          } />

          <Route path="/features/handwriting-recognition" element={
            <ProtectedRoute>
              <HandwritingRecognition />
            </ProtectedRoute>
          } />

          <Route path="/features/math-solver" element={
            <ProtectedRoute>
              <MathSolver />
            </ProtectedRoute>
          } />

          <Route path="/features/essay-grader" element={
            <ProtectedRoute>
              <EssayGrader />
            </ProtectedRoute>
          } />

          <Route path="/features/virtual-tutor" element={
            <ProtectedRoute>
              <VirtualTutor />
            </ProtectedRoute>
          } />

          <Route path="/features/plagiarism-checker" element={
            <ProtectedRoute>
              <PlagiarismChecker />
            </ProtectedRoute>
          } />

          <Route path="/features/learning-path" element={
            <ProtectedRoute>
              <LearningPath />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
