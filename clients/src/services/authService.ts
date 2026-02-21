import { api } from '@/lib/api';

export interface User {
    id: number;
    email: string;
    name?: string;
    role: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const loginUser = async (credentials: Record<string, string>) => {
    return await api.post<AuthResponse>('/api/auth/login', credentials);
};

export const registerUser = async (data: Record<string, string | undefined>) => {
    return await api.post<AuthResponse>('/api/auth/register', data);
};

export const logoutUser = async () => {
    return await api.post('/api/auth/logout', {});
};

export const getMe = async () => {
    return await api.get<{ user: User }>('/api/auth/me');
};
