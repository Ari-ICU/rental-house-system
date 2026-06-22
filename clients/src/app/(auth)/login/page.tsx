"use client";

import AuthForm from "@/components/auth/AuthForm";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const { setUser } = useAuth();
    const router = useRouter();

    const handleLogin = async (data: { email: string; password: string }) => {
        try {
            const res = await loginUser(data);
            if (res.success && res.data) {
                setUser(res.data.user);
                toast.success('Welcome back!');
                router.push('/dashboard');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-900 overflow-hidden">
            {/* Immersive Glowing Mesh Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulseGlow pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/25 rounded-full blur-[130px] animate-pulseGlow [animation-delay:3s] pointer-events-none" />
            
            {/* Cyber Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
            
            {/* Glassmorphic Form Canvas */}
            <div className="relative z-10 w-full flex justify-center p-4">
                <AuthForm onSubmit={handleLogin} />
            </div>
        </div>
    );
}
