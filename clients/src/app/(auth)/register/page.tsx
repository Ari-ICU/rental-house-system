"use client";

import AuthForm from "@/components/auth/AuthForm";
import { registerUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
    const { setUser } = useAuth();
    const router = useRouter();

    const handleRegister = async (data: { email: string; password: string; name?: string }) => {
        try {
            const res = await registerUser(data);
            if (res.success && res.data) {
                setUser(res.data.user);
                toast.success('Account created successfully!');
                router.push('/dashboard');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <AuthForm type="register" onSubmit={handleRegister} />
        </div>
    );
}
