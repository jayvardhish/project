import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Video, BookOpen, MessageSquare, PenTool, Calculator, FileText, Bot, ShieldAlert, Map, LayoutDashboard, LogOut, User as UserIcon, Zap } from 'lucide-react';

// Lazy Load Pages for Performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const VideoSummarizer = React.lazy(() => import('./pages/VideoSummarizer'));
const QuizGenerator = React.lazy(() => import('./pages/QuizGenerator'));
const HandwritingRecognition = React.lazy(() => import('./pages/HandwritingRecognition'));
const MathSolver = React.lazy(() => import('./pages/MathSolver'));
const VirtualTutor = React.lazy(() => import('./pages/VirtualTutor'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const About = React.lazy(() => import('./pages/About'));

// Loading Screen Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-gray-400 text-sm tracking-widest uppercase">Loading Resource...</p>
    </div>
  </div>
);

// Basic components (to be created)
const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="p-10 lg:p-16">
      <div className="mb-12">
        <div className="glass-pill mb-4 w-fit">Academic Command Center</div>
        <h1 className="text-5xl lg:text-6xl font-black text-accent tracking-tighter leading-none">
          Welcome, <span className="text-primary italic">{user?.username}!</span>
        </h1>
        <p className="mt-6 text-xl text-gray-400 font-medium max-w-2xl">
          Your multimodal learning engines are primed and ready. What will you master today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { to: "/features/video-summarizer", icon: <Video />, title: "Video Summarizer", desc: "Transcribe and extract key insights from lectures." },
          { to: "/features/quiz-generator", icon: <BookOpen />, title: "Quiz Generator", desc: "Generate smart assessments from any document." },
          { to: "/features/handwriting-recognition", icon: <PenTool />, title: "Handwriting OCR", desc: "Digitize your handwritten notes with 4K precision." },
          { to: "/features/math-solver", icon: <Calculator />, title: "Math Solver", desc: "Step-by-step LaTeX solutions for equations." },
          { to: "/features/virtual-tutor", icon: <Bot />, title: "Virtual Tutor", desc: "24/7 world-class academic assistance." }
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all group"
          >
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
              {React.cloneElement(item.icon, { className: "w-8 h-8" })}
            </div>
            <h3 className="text-2xl font-black mb-4 text-accent tracking-tight">{item.title}</h3>
            <p className="text-gray-400 font-medium leading-tight">{item.desc}</p>
          </Link>
        ))}
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
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/test-math" element={<MathSolver />} />

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

            <Route path="/features/virtual-tutor" element={
              <ProtectedRoute>
                <VirtualTutor />
              </ProtectedRoute>
            } />

            {/* Fallback */}
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
