'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { Rental } from "@/types/rents";
import { useLang } from "@/context/LangContext";

interface RentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    rental: Rental | null;
}

const RentalModal: React.FC<RentalModalProps> = ({ isOpen, onClose, rental }) => {
    const { lang } = useLang();

    if (!rental) return null;

    const t = {
        rentalDetails: lang === "en" ? "Rental Details" : "ព័ត៌មានជួល",
        clientName: lang === "en" ? "Client Name" : "ឈ្មោះអតិថិជន",
        room: lang === "en" ? "Room" : "បន្ទប់",
        status: lang === "en" ? "Status" : "ស្ថានភាព",
        rentAmount: lang === "en" ? "Rent Amount" : "ចំនួនជួល",
        startDate: lang === "en" ? "Start Date" : "ថ្ងៃចាប់ផ្តើម",
        endDate: lang === "en" ? "End Date" : "ថ្ងៃបញ្ចប់",
        notes: lang === "en" ? "Notes" : "កំណត់សម្គាល់",
        noNotes: lang === "en" ? "No notes" : "គ្មានកំណត់សម្គាល់",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 p-6 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={18} />
                        </button>

                        {/* Header */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                            {t.rentalDetails}
                        </h2>

                        {/* Info */}
                        <div className="space-y-3 text-gray-700">
                            <p>
                                <strong>{t.clientName}:</strong> {rental.ClientName || "N/A"}
                            </p>
                            <p>
                                <strong>{t.room}:</strong> {rental.roomNumber || "N/A"}
                            </p>
                            <p>
                                <strong>{t.status}:</strong>{" "}
                                <span className="font-medium">{rental.status}</span>
                            </p>
                            <p>
                                <strong>{t.rentAmount}:</strong> $
                                {rental.rentAmount?.toLocaleString() || "0"}/mo
                            </p>
                            <p>
                                <strong>{t.startDate}:</strong> {rental.startDate || "N/A"}
                            </p>
                            <p>
                                <strong>{t.endDate}:</strong> {rental.endDate || "N/A"}
                            </p>
                            <p>
                                <strong>{t.notes}:</strong>{" "}
                                {rental.notes ? (
                                    <span>{rental.notes}</span>
                                ) : (
                                    <span className="italic text-gray-500">{t.noNotes}</span>
                                )}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RentalModal;
