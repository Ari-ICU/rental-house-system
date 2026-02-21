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
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <AuthForm type="login" onSubmit={handleLogin} />
        </div>
    );
}
