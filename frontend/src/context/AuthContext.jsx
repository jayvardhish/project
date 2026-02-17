import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            return tokenFromUrl;
        }
        return localStorage.getItem('token');
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        console.log("AuthContext: Checking token...", { hasToken: !!token });
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchCurrentUser();
        } else {
            console.log("AuthContext: No token, unlocking loading");
            setLoading(false);
        }

        // Safety timeout: 3 seconds is plenty for a local/fast API
        const timer = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    console.warn("AuthContext: API taking too long, bypassing loading screen");
                    return false;
                }
                return prev;
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [token]);

    const fetchCurrentUser = async () => {
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/auth/me`;
            console.log("AuthContext: Fetching from:", apiUrl);
            const response = await axios.get(apiUrl, { timeout: 4000 });
            setUser(response.data);
            console.log("AuthContext: User verified");
        } catch (error) {
            console.error("AuthContext: Auth check failed:", error.message);
            if (error.response) {
                console.error("AuthContext: Server responded with status:", error.response.status);
            }
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h2 className="text-2xl font-black text-accent tracking-tighter italic">Smart<span className="text-primary">Learn</span></h2>
                        <p className="font-bold text-gray-400 text-xs tracking-[0.3em] uppercase mt-2">Initializing Multimodal Engine</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
