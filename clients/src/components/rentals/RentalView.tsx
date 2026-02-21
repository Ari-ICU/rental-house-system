'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaEdit,
    FaDoorOpen, FaDollarSign, FaCalendarAlt, FaIdCard,
    FaExclamationTriangle, FaStickyNote, FaUser, FaMoneyBillWave,
} from 'react-icons/fa';
import { Rental, RentalStatus } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import { formatKhmerDate } from '@/utils/dateFormatter';
import Image from 'next/image';

interface RentalViewProps {
    rental: Rental;
}

const statusConfig: { [key in RentalStatus]: { label: string; labelKm: string; dot: string; badge: string } } = {
    'Active': { label: 'Active', labelKm: 'កំពុងជួល', dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    'Reserved': { label: 'Reserved', labelKm: 'កក់ទុក', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
    'Completed': { label: 'Completed', labelKm: 'បានបញ្ចប់', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border border-gray-200' },
    'Maintenance': { label: 'Maintenance', labelKm: 'កំពុងជួសជុល', dot: 'bg-rose-400', badge: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

const avatarGradients = [
    'from-violet-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
];

function getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

const RentalView: React.FC<RentalViewProps> = ({ rental }) => {
    const { lang } = useLang();
    const router = useRouter();
    const label = (en: string, km: string) => (lang === 'km' ? km : en);

    const cfg = statusConfig[rental.status];
    const gradient = avatarGradients[rental.id % avatarGradients.length];
    const initials = getInitials(rental.ClientName || '?');

    const InfoRow = ({ icon, value }: { icon: React.ReactNode; value?: string }) => {
        if (!value) return null;
        return (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{icon}</span>
                <span>{value}</span>
            </div>
        );
    };

    const DetailCard = ({
        icon, iconBg, title, children,
    }: {
        icon: React.ReactNode; iconBg: string; title: string; children: React.ReactNode;
    }) => (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-xl shadow-purple-200">
                <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                {/* Back */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-all hover:-translate-x-1 w-fit"
                >
                    <FaArrowLeft className="text-sm" />
                    <span className="text-sm">{label('Back', 'ត្រឡប់ក្រោយ')}</span>
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {rental.image ? (
                            <div className="w-20 h-20 relative overflow-hidden rounded-2xl border-2 border-white/30 shadow-lg">
                                <Image
                                    src={rental.image}
                                    alt={rental.ClientName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg border-2 border-white/20`}>
                                <span className="text-white text-2xl font-bold">{initials}</span>
                            </div>
                        )}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                                {rental.ClientName}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {lang === 'km' ? cfg.labelKm : cfg.label}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-purple-200 text-sm mt-2">
                            <span className="flex items-center gap-1.5">
                                <FaDoorOpen className="text-xs" />
                                {label('Room', 'បន្ទប់')}: <strong className="text-white">{rental.roomNumber}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FaDollarSign className="text-xs" />
                                <strong className="text-white">${rental.rentAmount.toLocaleString()}</strong>/mo
                            </span>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => router.push(`/dashboard/rentals/edit/${rental.id}`)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/20 hover:border-white/40 flex-shrink-0"
                    >
                        <FaEdit className="text-xs" />
                        {label('Edit', 'កែប្រែ')}
                    </button>
                </div>
            </div>

            {/* Stat chips row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: <FaDollarSign />, label: label('Monthly Rent', 'ថ្លៃជួល/ខែ'), value: `$${rental.rentAmount.toLocaleString()}`, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    { icon: <FaDoorOpen />, label: label('Room', 'បន្ទប់'), value: rental.roomNumber, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { icon: <FaCalendarAlt />, label: label('Start Date', 'ចាប់ផ្តើម'), value: formatKhmerDate(rental.startDate ?? '', lang) || '—', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { icon: <FaCalendarAlt />, label: label('End Date', 'ថ្ងៃបញ្ចប់'), value: formatKhmerDate(rental.endDate ?? '', lang) || '—', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map(chip => (
                    <div key={chip.label} className={`${chip.bg} rounded-2xl p-4 border border-gray-100 dark:border-slate-700/50`}>
                        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${chip.color} opacity-70`}>{chip.label}</p>
                        <p className={`text-sm font-bold ${chip.color}`}>{chip.value}</p>
                    </div>
                ))}
            </div>

            {/* Client Info */}
            <DetailCard
                icon={<FaUser className="text-violet-600 text-xs" />}
                iconBg="bg-violet-100"
                title={label('Client Information', 'ព័ត៌មានអតិថិជន')}
            >
                <div className="space-y-3">
                    <InfoRow icon={<FaPhoneAlt size={13} />} value={rental.clientPhone} />
                    <InfoRow icon={<FaEnvelope size={13} />} value={rental.clientEmail} />
                    <InfoRow icon={<FaMapMarkerAlt size={13} />} value={rental.clientAddress} />
                    {!rental.clientPhone && !rental.clientEmail && !rental.clientAddress && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">{label('No contact details provided.', 'មិនមានព័ត៌មានទំនាក់ទំនង។')}</p>
                    )}
                </div>
            </DetailCard>

            {/* ID Cards */}
            <DetailCard
                icon={<FaIdCard className="text-amber-600 text-xs" />}
                iconBg="bg-amber-100"
                title={label('ID Card Documents', 'អត្តសញ្ញាណប័ណ្ណ')}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Front */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {label('Front Side', 'ខាងមុខ')}
                        </p>
                        {rental.clientImageCard?.front ? (
                            <div className="relative w-full h-48 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                <Image
                                    src={rental.clientImageCard.front}
                                    alt="Front ID"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-slate-800/50">
                                <FaIdCard className="text-gray-300 dark:text-slate-600 text-2xl" />
                                <p className="text-xs text-gray-400 dark:text-gray-500">{label('No image uploaded', 'មិនមានរូបភាព')}</p>
                            </div>
                        )}
                    </div>
                    {/* Back */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {label('Back Side', 'ខាងក្រោយ')}
                        </p>
                        {rental.clientImageCard?.back ? (
                            <div className="relative w-full h-48 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                <Image
                                    src={rental.clientImageCard.back}
                                    alt="Back ID"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-slate-800/50">
                                <FaIdCard className="text-gray-300 dark:text-slate-600 text-2xl" />
                                <p className="text-xs text-gray-400 dark:text-gray-500">{label('No image uploaded', 'មិនមានរូបភាព')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DetailCard>

            {/* Emergency Contact */}
            {(rental.emergencyContactName || rental.emergencyContactPhone) && (
                <DetailCard
                    icon={<FaExclamationTriangle className="text-red-500 text-xs" />}
                    iconBg="bg-red-100"
                    title={label('Emergency Contact', 'ទំនាក់ទំនងបន្ទាន់')}
                >
                    <div className="flex flex-col sm:flex-row gap-6">
                        {rental.emergencyContactName && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                    <FaUser className="text-red-400 text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">{label('Name', 'ឈ្មោះ')}</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rental.emergencyContactName}</p>
                                </div>
                            </div>
                        )}
                        {rental.emergencyContactPhone && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                    <FaPhoneAlt className="text-red-400 text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">{label('Phone', 'លេខទូរស័ព្ទ')}</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rental.emergencyContactPhone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DetailCard>
            )}

            {/* Billing History */}
            <DetailCard
                icon={<FaMoneyBillWave className="text-emerald-600 text-xs" />}
                iconBg="bg-emerald-100"
                title={label('Billing History', 'ប្រវត្តិនៃការបង់ប្រាក់')}
            >
                {rental.bills && rental.bills.length > 0 ? (
                    <div className="overflow-x-auto w-full -mx-6 sm:mx-0">
                        <table className="min-w-[600px] w-full text-xs text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-4 py-2">{label('Month', 'ខែ')}</th>
                                    <th className="px-4 py-2">{label('Elec ($)', 'អគ្គិសនី')}</th>
                                    <th className="px-4 py-2">{label('Water ($)', 'ទឹក')}</th>
                                    <th className="px-4 py-2">{label('Status', 'ស្ថានភាព')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                {rental.bills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                                            {formatKhmerDate(bill.month, lang)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">${bill.electricityAmount}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">${bill.waterAmount}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <span className={`px-1.5 py-0.5 rounded-md ${bill.electricityStatus === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'}`}>
                                                    E: {label(bill.electricityStatus, bill.electricityStatus === 'Paid' ? 'បង់ហើយ' : 'នៅ')}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-md ${bill.waterStatus === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'}`}>
                                                    W: {label(bill.waterStatus, bill.waterStatus === 'Paid' ? 'បង់ហើយ' : 'នៅ')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
                        {label('No billing records found.', 'មិនទាន់មានប្រវត្តិនៃការបង់ប្រាក់នៅឡើយទេ។')}
                    </p>
                )}
            </DetailCard>

            {/* Notes */}
            {rental.notes && (
                <DetailCard
                    icon={<FaStickyNote className="text-green-600 text-xs" />}
                    iconBg="bg-green-100"
                    title={label('Notes', 'កំណត់សម្គាល់')}
                >
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{rental.notes}</p>
                </DetailCard>
            )}

            {/* Bottom Edit CTA */}
            <button
                onClick={() => router.push(`/dashboard/rentals/edit/${rental.id}`)}
                className="w-full py-4 px-6 rounded-2xl font-bold text-white text-sm tracking-wide flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
                <FaEdit className="text-white/80" />
                {label('Edit This Rental', 'កែប្រែការជួលនេះ')}
            </button>

        </div>
    );
};

export default RentalView;
