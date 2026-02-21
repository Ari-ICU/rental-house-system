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
        <div className="min-h-screen flex items-center justify-center relative bg-slate-50">
            {/* Subtle Grid Pattern for Classic Modern Look */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#slate-200_1px,transparent_1px),linear-gradient(to_bottom,#slate-200_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />

            <div className="relative z-10 w-full flex justify-center p-4">
                <AuthForm onSubmit={handleLogin} />
            </div>
        </div>
    );
}
