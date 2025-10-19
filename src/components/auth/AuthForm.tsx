"use client";

import { useState } from "react";
import InputField from "./InputField";

interface AuthFormProps {
    type: "login" | "register";
    onSubmit: (data: { email: string; password: string; name?: string }) => void;
}

const AuthForm = ({ type, onSubmit }: AuthFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password, name: type === "register" ? name : undefined });
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
            >
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    {type === "login" ? "Welcome Back 👋" : "Create Your Account 📝"}
                </h2>

                {type === "register" && (
                    <InputField
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                    />
                )}

                <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />

                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                />

                <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium text-lg shadow hover:bg-blue-700 transition-all duration-200"
                >
                    {type === "login" ? "Sign In" : "Sign Up"}
                </button>

                <p className="text-sm text-gray-600 text-center mt-6">
                    {type === "login" ? (
                        <>
                            Don’t have an account?{" "}
                            <a
                                href="/register"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Sign up
                            </a>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <a
                                href="/login"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Log in
                            </a>
                        </>
                    )}
                </p>
            </form>
        </div>
    );
};

export default AuthForm;
