'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaEdit,
    FaDoorOpen, FaDollarSign, FaCalendarAlt, FaIdCard,
    FaExclamationTriangle, FaStickyNote, FaUser, FaHome,
} from 'react-icons/fa';
import { Rental, RentalStatus } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import { formatKhmerDate } from '@/utils/dateFormatter';

interface RentalViewProps {
    rental: Rental;
}

const statusConfig: { [key in RentalStatus]: { label: string; labelKm: string; dot: string; badge: string } } = {
    'In-Active': { label: 'Active', labelKm: 'សកម្ម', dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    'Non-Active': { label: 'Inactive', labelKm: 'មិនសកម្ម', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border border-gray-200' },
    'Past': { label: 'Past', labelKm: 'កន្លងផុត', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
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
            <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-gray-400 flex-shrink-0">{icon}</span>
                <span>{value}</span>
            </div>
        );
    };

    const DetailCard = ({
        icon, iconBg, title, children,
    }: {
        icon: React.ReactNode; iconBg: string; title: string; children: React.ReactNode;
    }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h2>
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
                            <img
                                src={rental.image}
                                alt={rental.ClientName}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
                            />
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
                    { icon: <FaDollarSign />, label: label('Monthly Rent', 'ថ្លៃជួល/ខែ'), value: `$${rental.rentAmount.toLocaleString()}`, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { icon: <FaDoorOpen />, label: label('Room', 'បន្ទប់'), value: rental.roomNumber, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: <FaCalendarAlt />, label: label('Start Date', 'ចាប់ផ្តើម'), value: formatKhmerDate(rental.startDate ?? '', lang) || '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: <FaCalendarAlt />, label: label('End Date', 'ថ្ងៃបញ្ចប់'), value: formatKhmerDate(rental.endDate ?? '', lang) || '—', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(chip => (
                    <div key={chip.label} className={`${chip.bg} rounded-2xl p-4 border border-gray-100`}>
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
                        <p className="text-sm text-gray-400 italic">{label('No contact details provided.', 'មិនមានព័ត៌មានទំនាក់ទំនង។')}</p>
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
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {label('Front Side', 'ខាងមុខ')}
                        </p>
                        {rental.clientImageCard?.front ? (
                            <img
                                src={rental.clientImageCard.front}
                                alt="Front ID"
                                className="w-full rounded-xl border border-gray-200 shadow-sm object-cover max-h-48"
                            />
                        ) : (
                            <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50">
                                <FaIdCard className="text-gray-300 text-2xl" />
                                <p className="text-xs text-gray-400">{label('No image uploaded', 'មិនមានរូបភាព')}</p>
                            </div>
                        )}
                    </div>
                    {/* Back */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {label('Back Side', 'ខាងក្រោយ')}
                        </p>
                        {rental.clientImageCard?.back ? (
                            <img
                                src={rental.clientImageCard.back}
                                alt="Back ID"
                                className="w-full rounded-xl border border-gray-200 shadow-sm object-cover max-h-48"
                            />
                        ) : (
                            <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50">
                                <FaIdCard className="text-gray-300 text-2xl" />
                                <p className="text-xs text-gray-400">{label('No image uploaded', 'មិនមានរូបភាព')}</p>
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
                                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <FaUser className="text-red-400 text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label('Name', 'ឈ្មោះ')}</p>
                                    <p className="text-sm font-semibold text-gray-800">{rental.emergencyContactName}</p>
                                </div>
                            </div>
                        )}
                        {rental.emergencyContactPhone && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <FaPhoneAlt className="text-red-400 text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label('Phone', 'លេខទូរស័ព្ទ')}</p>
                                    <p className="text-sm font-semibold text-gray-800">{rental.emergencyContactPhone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DetailCard>
            )}

            {/* Notes */}
            {rental.notes && (
                <DetailCard
                    icon={<FaStickyNote className="text-green-600 text-xs" />}
                    iconBg="bg-green-100"
                    title={label('Notes', 'កំណត់សម្គាល់')}
                >
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{rental.notes}</p>
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
