import React from 'react';
import SettingsForm from '@/components/settings/SettingsForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings - RentManager Pro',
    description: 'System settings and configurations',
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <SettingsForm />
        </div>
    );
}
