"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { Report } from "@/types/report";
import { FaArrowLeft, FaFileAlt, FaCalendarAlt, FaTag, FaCheckCircle, FaPrint, FaDownload } from "react-icons/fa";
import * as reportService from "@/services/reportService";

const ReportViewPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { lang } = useLang();
    const reportId = params.id as string;

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await reportService.getReportById(reportId);
                setReport(data);
            } catch (error) {
                console.error("Failed to fetch report:", error);
            } finally {
                setLoading(false);
            }
        };

        if (reportId) fetchReport();
    }, [reportId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center border border-gray-100">
                    <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaFileAlt className="text-rose-500" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Report Not Found</h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        {lang === 'km' ? 'របាយការណ៍ដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានលុបចេញ។' : 'The report you\'re looking for doesn\'t exist or was removed.'}
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/reports")}
                        className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/25"
                    >
                        {lang === 'km' ? 'ត្រឡប់ទៅរបាយការណ៍វិញ' : 'Go Back to Reports'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Navigation & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-bold group"
                    >
                        <FaArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        {lang === 'km' ? 'ត្រឡប់ទៅបញ្ជីវិញ' : 'Back to list'}
                    </button>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-bold shadow-sm active:scale-95">
                            <FaPrint size={14} className="text-gray-400" />
                            {lang === 'km' ? 'បោះពុម្ព' : 'Print'}
                        </button>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-blue-500/25 active:scale-95">
                            <FaDownload size={14} />
                            {lang === 'km' ? 'ទាញយក PDF' : 'Download PDF'}
                        </button>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 sm:p-12 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 text-blue-300">
                                    <FaFileAlt size={10} />
                                    {lang === 'km' ? 'របាយការណ៍ប្រព័ន្ធ' : 'System Report'}
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                                    {report.name}
                                </h1>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shrink-0">
                                <div className={`w-3 h-3 rounded-full ${report.status === 'Completed' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
                                <span className="text-lg font-black uppercase tracking-tighter">
                                    {report.status === 'Completed'
                                        ? (lang === 'km' ? 'បានបញ្ចប់' : 'Completed')
                                        : (lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/50">
                        <div className="p-8 flex items-center gap-4">
                            <div className="bg-blue-100 p-3.5 rounded-2xl">
                                <FaTag className="text-blue-600" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {lang === 'km' ? 'ចំណាត់ថ្នាក់' : 'Category'}
                                </p>
                                <p className="text-lg font-extrabold text-gray-800">{report.type}</p>
                            </div>
                        </div>
                        <div className="p-8 flex items-center gap-4">
                            <div className="bg-indigo-100 p-3.5 rounded-2xl">
                                <FaCalendarAlt className="text-indigo-600" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {lang === 'km' ? 'ថ្ងៃបង្កើត' : 'Generated On'}
                                </p>
                                <p className="text-lg font-extrabold text-gray-800">{new Date(report.generatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="p-8 flex items-center gap-4">
                            <div className="bg-emerald-100 p-3.5 rounded-2xl">
                                <FaCheckCircle className="text-emerald-600" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {lang === 'km' ? 'រយៈពេលរាយការណ៍' : 'Report Period'}
                                </p>
                                <p className="text-sm font-extrabold text-gray-800">
                                    {report.startDate && report.endDate
                                        ? `${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`
                                        : (lang === 'km' ? 'មិ​នកំណត់' : 'Not specified')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Content Section */}
                    <div className="p-8 sm:p-12 space-y-10">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                {lang === 'km' ? 'សេចក្តីសង្ខេបប្រតិបត្តិ' : 'Executive Summary'}
                            </h3>
                            <div className="prose prose-blue max-w-none text-gray-600 font-medium leading-relaxed">
                                <p className="text-lg">
                                    {lang === 'km'
                                        ? `ទិដ្ឋភាពទូទៅនៃបណ្តុំទិន្នន័យ "${report.name}" ។ សេចក្តីសង្ខេបដែលបានបង្កើតដោយស្វ័យប្រវត្តិនេះ ផ្តល់នូវរង្វាស់ស្នូល និងសូចនាករការអនុវត្តសំខាន់ៗដែលពាក់ព័ន្ធនឹងប្រភេទ ${report.type} ។`
                                        : `Comprehensive overview of the "${report.name}" data collection. This automatically generated summary provides the core metrics and key performance indicators relevant to the ${report.type} category.`}
                                </p>
                                <p>
                                    {lang === 'km'
                                        ? <>ទិន្នន័យទាំងអស់ត្រូវបានផ្ទៀងផ្ទាត់ជាមួយនឹងឃ្លាំងជួលមេ ហើយបច្ចុប្បន្នត្រូវបានសម្គាល់ថា <strong className="text-gray-900 underline decoration-blue-500 decoration-4 underline-offset-4">{report.status === 'Completed' ? 'បានបញ្ចប់' : 'កំពុងពិនិត្យ'}</strong> ។ សម្រាប់ការវិភាគលម្អិតនៃអនុរង្វាស់ សូមយោងទៅលើសន្លឹកកិច្ចការលម្អិតដែលបានភ្ជាប់មកជាមួយ ឬតារាងព័ត៌មានអន្តរកម្មឌីជីថល។</>
                                        : <>All data points have been verified against the master rental repository and are currently marked as <strong className="text-gray-900 underline decoration-blue-500 decoration-4 underline-offset-4">{report.status}</strong>. For detailed breakdown of sub-metrics, please refer to the attached detailed spreadsheet or the digital interactive dashboard.</>}
                                </p>
                            </div>
                        </div>

                        {/* Visual Separator */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                        {/* Analysis Note */}
                        <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100/50 flex flex-col sm:flex-row gap-6 items-start">
                            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                                <FaFileAlt size={24} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-blue-900 italic">
                                    {lang === 'km' ? 'អនុសាសន៍របស់អ្នកវិភាគ' : 'Analyst Recommendation'}
                                </h4>
                                <p className="text-blue-800/70 font-medium leading-normal">
                                    {lang === 'km'
                                        ? `ផ្អែកលើស្ថានភាព ${report.status === 'Completed' ? 'បានបញ្ចប់' : 'កំពុងពិនិត្យ'} បច្ចុប្បន្ន យើងសូមណែនាំឱ្យបន្តការត្រួតពិនិត្យប្រចាំត្រីមាស។ គ្មានភាពមិនប្រក្រតីសំខាន់ៗត្រូវបានរកឃើញនៅក្នុងចរន្ត ${report.type} សម្រាប់រយៈពេលរាយការណ៍នេះទេ។`
                                        : `Based on the current ${report.status} state, we recommend proceeding with the quarterly review. No significant anomalies were detected in the ${report.type} stream for this reporting period.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <p className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Digital Authentication Mark: R-{report.id.toString().padStart(8, '0')}-SYS-PROD
                </p>
            </div>
        </div>
    );
};

export default ReportViewPage;
