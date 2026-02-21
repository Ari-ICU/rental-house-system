'use client';

import React, { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { FaSave, FaTelegramPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CustomDropdown from '@/common/CustomDropdown';

export default function SettingsForm() {
    const { lang } = useLang();
    const label = React.useCallback((en: string, km: string) => (lang === 'km' ? km : en), [lang]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        telegramBotToken: '',
        telegramChatId: '',
        telegramLanguage: 'en',
        paymentBakongAccountId: '',
        paywayMerchantId: '',
        paywayApiKey: '',
        electricityRate: 0,
        waterRate: 0,
        exchangeRate: 4100,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setFormData({
                            telegramBotToken: data.data.telegramBotToken || '',
                            telegramChatId: data.data.telegramChatId || '',
                            telegramLanguage: data.data.telegramLanguage || 'en',
                            paymentBakongAccountId: data.data.paymentBakongAccountId || '',
                            paywayMerchantId: data.data.paywayMerchantId || '',
                            paywayApiKey: data.data.paywayApiKey || '',
                            electricityRate: data.data.electricityRate || 0,
                            waterRate: data.data.waterRate || 0,
                            exchangeRate: data.data.exchangeRate || 4100,
                        });
                    }
                }
            } catch {
                toast.error(label('Failed to load settings', 'បរាជ័យក្នុងការទាញយកការកំណត់'));
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [lang, label]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(label('Settings saved successfully', 'ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ'));
            } else {
                toast.error(label('Failed to save settings', 'បរាជ័យក្នុងការរក្សាទុកការកំណត់'));
            }
        } catch {
            toast.error(label('Error saving settings', 'មានបញ្ហាក្នុងការរក្សាទុកការកំណត់'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    const languageOptions = [
        { value: 'en', label: 'English', icon: '🇺🇸' },
        { value: 'km', label: 'Khmer (ខ្មែរ)', icon: '🇰🇭' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-8 shadow-xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                            {label('System Settings', 'ការកំណត់ប្រព័ន្ធ')}
                        </h1>
                        <p className="text-indigo-200 mt-2 text-sm max-w-xl leading-relaxed opacity-90">
                            {label('Manage your global system configurations.', 'គ្រប់គ្រងការកំណត់ប្រព័ន្ធទូទៅរបស់អ្នក។')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-8">
                {/* Telegram Settings Group */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <FaTelegramPlane className="text-blue-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{label('Telegram Bot Integration', 'ការរួមបញ្ចូល Telegram Bot')}</h2>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{label('Required for unpaid utility alerts', 'ចាំបាច់សម្រាប់ការដាស់តឿនវិក្កយបត្រមិនទាន់បង់ប្រាក់')}</p>
                        </div>
                    </div>

                    {/* Bot Helper Info Box */}
                    {formData.telegramBotToken && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm shadow-blue-50">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold text-lg">💡</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-blue-900">{label('ID Helper Bot is Active', 'ID Helper Bot គឺសកម្ម')}</h4>
                                <p className="text-[11px] text-blue-800 leading-relaxed opacity-80">
                                    {label(
                                        'Your bot is now programmed to help customers. Tell your tenants to search for your bot and send ',
                                        'បច្ចុប្បន្ន Bot របស់អ្នកត្រូវបានកំណត់ដើម្បីជួយអតិថិជន។ សូមប្រាប់អតិថិជនឱ្យស្វែងរក Bot របស់អ្នក ហើយផ្ញើ '
                                    )}
                                    <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-bold mx-1">/myid</code>
                                    {label(
                                        'to get their Chat ID instantly.',
                                        'ដើម្បីទទួលបានលេខសម្គាល់ Chat របស់ពួកគេភ្លាមៗ។'
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bot Token */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                {label('Bot Token', 'លេខកូដសម្ងាត់ Bot')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.telegramBotToken}
                                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="123456789:ABCDefGHIJKlmnOpQrstuVWxYZ"
                            />
                            <p className="text-[10px] text-gray-400">
                                {label('Get this from @BotFather in Telegram', 'ទទួលបានវាពី @BotFather នៅក្នុង Telegram')}
                            </p>
                        </div>

                        {/* Chat ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                {label('Chat ID', 'លេខសម្គាល់ក្រុម Chat')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.telegramChatId}
                                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="-100123456789"
                            />
                            <p className="text-[10px] text-gray-400">
                                {label('The group or user ID where alerts will be sent', 'លេខសម្គាល់ក្រុម ឬអ្នកប្រើប្រាស់ដែលការដាស់តឿននឹងត្រូវបញ្ជូនទៅ')}
                            </p>
                        </div>

                        {/* Alert Language */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                {label('Alert Language', 'ភាសាដាស់តឿន')}
                            </label>
                            <CustomDropdown
                                options={languageOptions}
                                value={formData.telegramLanguage}
                                onChange={(val) => setFormData({ ...formData, telegramLanguage: val })}
                                placeholder={label('Select language', 'ជ្រើសរើសភាសា')}
                            />
                            <p className="text-[10px] text-gray-400">
                                {label('Language used for the automated Telegram alert messages', 'ភាសាដែលប្រើសម្រាប់សារដាស់តឿន Telegram ស្វ័យប្រវត្តិ')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Integrations */}
                <div className="space-y-6 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <span className="text-xl">🇰🇭</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{label('Payment Integration', 'ការរួមបញ្ចូលការបង់ប្រាក់')}</h2>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{label('Configure KHQR & Payway for automatic bill payments', 'កំណត់ KHQR និង Payway សម្រាប់ការបង់វិក្កយបត្រដោយស្វ័យប្រវត្តិ')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bakong Account ID */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                {label('Bakong KHQR Account ID', 'លេខគណនី Bakong KHQR')}
                            </label>
                            <input
                                type="text"
                                value={formData.paymentBakongAccountId}
                                onChange={(e) => setFormData({ ...formData, paymentBakongAccountId: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="clientaccount@bank"
                            />
                            <p className="text-[10px] text-gray-400">
                                {label('Your Bakong Account ID used to generate static payment QR codes.', 'លេខគណនី Bakong របស់អ្នកដែលប្រើសម្រាប់បង្កើតកូដ QR បង់ប្រាក់។')}
                            </p>
                        </div>

                        {/* Payway Merchant ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                {label('Payway Merchant ID', 'លេខសម្គាល់អាជីវករ Payway')}
                            </label>
                            <input
                                type="text"
                                value={formData.paywayMerchantId}
                                onChange={(e) => setFormData({ ...formData, paywayMerchantId: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="rths_merchant"
                            />
                        </div>

                        {/* Payway API Key */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                {label('Payway API Key', 'សោរ API Payway')}
                            </label>
                            <input
                                type="password"
                                value={formData.paywayApiKey}
                                onChange={(e) => setFormData({ ...formData, paywayApiKey: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="****************"
                            />
                        </div>

                        {/* Utility Rates Group */}
                        <div className="md:col-span-2 pt-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <span className="text-xl">⚡</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{label('Utility Rates', 'ថ្លៃសេវាប្រើប្រាស់')}</h2>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">{label('Set your standard rates for electricity and water', 'កំណត់តម្លៃស្តង់ដារសម្រាប់អគ្គិសនី និងទឹក')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                        {label('Electricity Rate ($/kWh)', 'ថ្លៃអគ្គិសនី ($/kWh)')}
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.electricityRate}
                                        onChange={(e) => setFormData({ ...formData, electricityRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="0.25"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                        {label('Water Rate ($/m³)', 'ថ្លៃទឹក ($/m³)')}
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.waterRate}
                                        onChange={(e) => setFormData({ ...formData, waterRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="0.15"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                        {label('Exchange Rate (1$ = ? KHR)', 'អត្រាប្តូរប្រាក់ (1$ = ? KHR)')}
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.exchangeRate}
                                        onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="4100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`
                            relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-sm shadow-lg overflow-hidden transition-all duration-300
                            ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 active:scale-95'}
                        `}
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {label('Saving...', 'កំពុងរក្សាទុក...')}
                            </>
                        ) : (
                            <>
                                <FaSave className="text-lg" />
                                <span>{label('Save Settings', 'រក្សាទុកការកំណត់')}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
