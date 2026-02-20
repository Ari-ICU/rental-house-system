import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import toast from "react-hot-toast";

interface PaymentViewProps {
    billId: number;
    amount: number;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export default function PaymentView({ billId, amount, onClose, onPaymentSuccess }: PaymentViewProps) {
    const { lang } = useLang();
    const [qrString, setQrString] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentIntent = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/payments/initiate/${billId}`);
                const data = await res.json();
                if (data.success && data.data.qrString) {
                    setQrString(data.data.qrString);
                } else if (!data.data.qrString) {
                    setError(lang === 'en' ? "Please configure Bakong KHQR Account ID in Settings." : "សូមកំណត់លេខគណនី Bakong KHQR នៅក្នុងការកំណត់។");
                }
            } catch (err) {
                setError(lang === 'en' ? "Failed to generate payment." : "បរាជ័យក្នុងការបង្កើតការបង់ប្រាក់។");
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentIntent();
    }, [billId, lang]);

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/payments/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId, amount })
            });
            if (res.ok) {
                toast.success(lang === 'en' ? 'Payment processed!' : 'ការបង់ប្រាក់ទទួលបានជោគជ័យ!');
                onPaymentSuccess();
            } else {
                toast.error(lang === 'en' ? 'Gateway Simulation Error' : 'កំហុសច្រកបង់ប្រាក់');
            }
        } catch (e) {
            toast.error('Simulation Failed');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="p-6 sm:p-10 flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-full flex justify-between items-center text-gray-500 mb-2">
                <button onClick={onClose} className="hover:text-indigo-600 transition flex items-center gap-2 font-bold px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100">
                    <FaArrowLeft /> {lang === 'en' ? 'Back' : 'ត្រលប់ក្រោយ'}
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <FaSpinner className="animate-spin text-4xl text-indigo-500" />
                    <p className="text-sm font-bold text-gray-500 tracking-wide">
                        {lang === 'en' ? 'Generating Secure KHQR...' : 'កំពុងបង្កើតកូដ KHQR...'}
                    </p>
                </div>
            ) : error ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                        <FaExclamationTriangle className="text-3xl" />
                    </div>
                    <p className="font-black text-gray-800 text-lg">{lang === 'en' ? 'Gateway Error' : 'កំហុសច្រកទ្វារបង់ប្រាក់'}</p>
                    <p className="text-sm text-gray-500 max-w-xs">{error}</p>
                </div>
            ) : (
                <>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black tracking-tight text-gray-900">
                            {lang === 'en' ? 'Scan to Pay' : 'ស្កេនដើម្បីបង់ប្រាក់'}
                        </h3>
                        <p className="text-sm font-medium text-gray-500">
                            {lang === 'en' ? 'Use Bakong or any supported banking app.' : 'ប្រើប្រាស់កម្មវិធីធនាគារបាគង ឬធនាគារដែលគាំទ្រ។'}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-indigo-50 hover:border-indigo-100 transition-colors">
                        {qrString && <QRCode value={qrString} size={240} fgColor="#312e81" />}
                    </div>

                    <div className="text-center space-y-1 bg-gray-50 w-full rounded-2xl py-4 border border-dashed border-gray-200">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                            {lang === 'en' ? 'Amount Due' : 'ទឹកប្រាក់ត្រូវបង់'}
                        </p>
                        <p className="text-4xl font-black text-indigo-600 tracking-tighter">
                            ${amount.toLocaleString()}
                        </p>
                    </div>

                    {/* Developer Mock Checkout */}
                    <div className="pt-6 w-full flex flex-col items-center">
                        <p className="text-[10px] text-gray-400 mb-3 text-center px-4">
                            {lang === 'en' ? 'Developer Simulation: Bypasses the bank API and triggers a success webhook natively.' : 'ការក្លែងធ្វើសម្រាប់អ្នកអភិវឌ្ឍន៍៖ រំលងធនាគារហើយកេះការបង់ភាគលុយជោគជ័យ។'}
                        </p>
                        <button
                            onClick={handleSimulate}
                            disabled={simulating}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 duration-300 w-full sm:w-auto shadow-sm"
                        >
                            {simulating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle className="text-lg" />}
                            {lang === 'en' ? 'Simulate Payment Webhook' : 'ក្លែងធ្វើការបង់ប្រាក់ជោគជ័យ'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
