import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Upload, Brain, CheckCircle2, XCircle, Info, ArrowRight, Trophy } from 'lucide-react';
import axios from 'axios';

const QuizGenerator = () => {
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Content, 2: Generation, 3: Taking, 4: Results

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const generateQuiz = async () => {
        if (!content && !file) return alert("Please provide text or a file.");

        setLoading(true);
        setCurrentStep(2);

        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('content', content);
        formData.append('difficulty', 'medium');
        formData.append('num_questions', '5');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/quizzes/generate`, formData);
            setQuiz(response.data);
            setCurrentStep(3);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            alert("Error generating quiz.");
            setCurrentStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (qIdx, option) => {
        setUserAnswers({ ...userAnswers, [qIdx]: option });
    };

    const calculateScore = () => {
        let score = 0;
        quiz.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correct_answer) score++;
        });
        return score;
    };

    const shuffleQuestions = () => {
        const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
        setQuiz({ ...quiz, questions: shuffled });
        setUserAnswers({});
        setCurrentStep(3);
        setShowResults(false);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-accent mb-4">AI Quiz Generator</h1>
                <p className="text-gray-500">Transform your study materials into interactive assessment modules instantly.</p>
            </div>

            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-lg font-bold flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-primary" /> Paste Text Content
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste article, lecture notes, or any text here..."
                                    className="w-full h-80 p-6 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary outline-none resize-none shadow-sm"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-lg font-bold flex items-center">
                                    <Upload className="w-5 h-5 mr-2 text-primary" /> Or Upload Document
                                </label>
                                <div className="h-80 border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-primary transition-all group">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <input type="file" onChange={handleFileChange} id="doc-upload" className="hidden" accept=".pdf,.txt" />
                                    <label htmlFor="doc-upload" className="cursor-pointer px-6 py-2 bg-white text-accent font-semibold rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                                        {file ? file.name : "Choose File"}
                                    </label>
                                    <p className="mt-4 text-xs text-gray-400">PDF or Text files preferred.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={generateQuiz}
                                className="btn-primary w-full md:w-fit px-12 py-4 flex items-center justify-center text-lg"
                            >
                                Generate Quiz <Brain className="ml-2 w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
                        <h2 className="text-3xl font-bold text-accent mb-4">Generating Your Quiz...</h2>
                        <p className="text-gray-500 max-w-md">Our AI is analyzing the content and crafting challenging questions to test your knowledge.</p>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12 pb-24"
                    >
                        <div className="flex items-center justify-between sticky top-20 bg-white/80 backdrop-blur-md py-4 z-10 border-b border-gray-50 px-4 -mx-4">
                            <h2 className="text-2xl font-bold text-accent">{quiz.title}</h2>
                            <span className="bg-secondary text-primary px-4 py-1 rounded-full font-bold text-sm">
                                {quiz.questions.length} Questions
                            </span>
                        </div>

                        <div className="space-y-8">
                            {quiz.questions.map((q, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                    <div className="flex items-start mb-6">
                                        <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <h3 className="text-xl font-bold text-accent leading-tight">{q.question}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                                        {q.options.map((option, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswerSelect(idx, option)}
                                                className={`p-4 text-left rounded-2xl border transition-all ${userAnswers[idx] === option
                                                    ? 'border-primary bg-secondary/20 text-primary font-bold shadow-md'
                                                    : 'border-gray-100 hover:border-primary-light hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    if (Object.keys(userAnswers).length < quiz.questions.length) {
                                        return alert("Please answer all questions before submitting.");
                                    }
                                    setCurrentStep(4);
                                    setShowResults(true);
                                }}
                                className="btn-primary px-12 py-4 text-lg shadow-xl"
                            >
                                Submit Answers <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-12"
                    >
                        <div className="purple-gradient text-white rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
                                <h2 className="text-5xl font-bold mb-2">Quiz Results</h2>
                                <p className="text-2xl text-purple-100 mb-8">You scored <span className="text-white bg-white/30 px-3 py-1 rounded-lg">{calculateScore()} / {quiz.questions.length}</span></p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => { setCurrentStep(1); setQuiz(null); setUserAnswers({}); }} className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
                                        New Quiz
                                    </button>
                                    <button onClick={shuffleQuestions} className="bg-white/20 text-white border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition-all">
                                        Shuffle & Retry
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                {/* Decorative dots or patterns */}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold px-4">Detailed Review</h3>
                            {quiz.questions.map((q, idx) => (
                                <div key={idx} className={`p-8 rounded-3xl border ${userAnswers[idx] === q.correct_answer ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex items-start mb-4">
                                        {userAnswers[idx] === q.correct_answer ? <CheckCircle2 className="w-6 h-6 text-green-500 mr-4 mt-1" /> : <XCircle className="w-6 h-6 text-red-500 mr-4 mt-1" />}
                                        <h4 className="text-lg font-bold">{q.question}</h4>
                                    </div>
                                    <div className="ml-10 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Your Answer</p>
                                                <p className={userAnswers[idx] === q.correct_answer ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{userAnswers[idx]}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Correct Answer</p>
                                                <p className="text-green-600 font-semibold">{q.correct_answer}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl border border-white/50 flex items-start">
                                            <Info className="w-5 h-5 text-primary mr-3 mt-0.5" />
                                            <p className="text-sm text-gray-600 italic leading-relaxed">{q.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizGenerator;
