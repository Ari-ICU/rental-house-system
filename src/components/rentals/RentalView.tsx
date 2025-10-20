'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import { formatKhmerDate } from '@/utils/dateFormatter';

interface RentalViewProps {
    rental: Rental;
}

const RentalView: React.FC<RentalViewProps> = ({ rental }) => {
    const { lang } = useLang();
    const router = useRouter();

    const label = (en: string, km: string) => (lang === 'km' ? km : en);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Back Button */}
            <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-6"
            >
                <FaArrowLeft /> {label('Back', 'ត្រឡប់ក្រោយ')}
            </button>

            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">
                    {label('Rental Details', 'ព័ត៌មានការជួល')}
                </h1>
                <p className="text-gray-500">{label('View all rental information below.', 'មើលព័ត៌មានលម្អិតអំពីការជួលខាងក្រោម។')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Client Info */}
                <div>
                    <h2 className="text-lg font-semibold text-blue-600 mb-3">{label('Client Information', 'ព័ត៌មានអតិថិជន')}</h2>

                    <div className="flex items-center gap-4 mb-4">
                        {rental.image ? (
                            <img
                                src={rental.image}
                                alt="Client"
                                className="w-24 h-24 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {label('No Image', 'គ្មានរូបភាព')}
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-lg">{rental.ClientName}</p>
                            <p className="text-sm text-gray-600">{label('Room', 'បន្ទប់')}: {rental.roomNumber}</p>
                            <p className="text-sm text-gray-600">{label('Status', 'ស្ថានភាព')}: {rental.status}</p>
                        </div>
                    </div>

                    {rental.clientPhone && (
                        <p className="flex items-center gap-2 text-gray-700 mb-1">
                            <FaPhoneAlt className="text-blue-500" /> {rental.clientPhone}
                        </p>
                    )}
                    {rental.clientEmail && (
                        <p className="flex items-center gap-2 text-gray-700 mb-1">
                            <FaEnvelope className="text-blue-500" /> {rental.clientEmail}
                        </p>
                    )}
                    {rental.clientAddress && (
                        <p className="flex items-center gap-2 text-gray-700">
                            <FaMapMarkerAlt className="text-blue-500" /> {rental.clientAddress}
                        </p>
                    )}
                </div>

                {/* Rental Details */}
                <div>
                    <h2 className="text-lg font-semibold text-blue-600 mb-3">{label('Rental Details', 'ព័ត៌មានការជួល')}</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">{label('Rent Amount', 'តម្លៃជួល')}:</span> ${rental.rentAmount}</p>
                        <p>
                            <span className="font-medium">{label('Start Date', 'ថ្ងៃចាប់ផ្តើម')}:</span>{' '}
                            {rental.startDate ? formatKhmerDate(rental.startDate, lang) : '-'}
                        </p>
                        <p>
                            <span className="font-medium">{label('End Date', 'ថ្ងៃបញ្ចប់')}:</span>{' '}
                            {rental.endDate ? formatKhmerDate(rental.endDate, lang) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <hr className="my-6" />

            {/* ID Card Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-blue-600 mb-3">{label('ID Card (Front)', 'អត្តសញ្ញាណប័ណ្ណ (មុខ)')}</h3>
                    {rental.clientImageCard?.front ? (
                        <img
                            src={rental.clientImageCard.front}
                            alt="Front ID"
                            className="w-full max-w-xs rounded-lg border"
                        />
                    ) : (
                        <p className="text-gray-500">{label('No front image uploaded.', 'មិនមានរូបភាពខាងមុខ។')}</p>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-blue-600 mb-3">{label('ID Card (Back)', 'អត្តសញ្ញាណប័ណ្ណ (ក្រោយ)')}</h3>
                    {rental.clientImageCard?.back ? (
                        <img
                            src={rental.clientImageCard.back}
                            alt="Back ID"
                            className="w-full max-w-xs rounded-lg border"
                        />
                    ) : (
                        <p className="text-gray-500">{label('No back image uploaded.', 'មិនមានរូបភាពខាងក្រោយ។')}</p>
                    )}
                </div>
            </div>

            {/* Emergency Contact */}
            {(rental.emergencyContactName || rental.emergencyContactPhone) && (
                <>
                    <hr className="my-6" />
                    <div>
                        <h2 className="text-lg font-semibold text-blue-600 mb-3">{label('Emergency Contact', 'ទំនាក់ទំនងបន្ទាន់')}</h2>
                        <p><span className="font-medium">{label('Name', 'ឈ្មោះ')}:</span> {rental.emergencyContactName || '-'}</p>
                        <p><span className="font-medium">{label('Phone', 'លេខទូរស័ព្ទ')}:</span> {rental.emergencyContactPhone || '-'}</p>
                    </div>
                </>
            )}

            {/* Notes */}
            {rental.notes && (
                <>
                    <hr className="my-6" />
                    <div>
                        <h2 className="text-lg font-semibold text-blue-600 mb-3">{label('Notes', 'កំណត់សម្គាល់')}</h2>
                        <p className="text-gray-700 whitespace-pre-line">{rental.notes}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default RentalView;
