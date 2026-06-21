"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBillPdfBuffer = void 0;
const pdfkit_table_1 = __importDefault(require("pdfkit-table"));
const qrcode_1 = __importDefault(require("qrcode"));
const bakong_khqr_1 = require("bakong-khqr");
const path_1 = __importDefault(require("path"));
const generateBillPdfBuffer = async (bill, settings) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new pdfkit_table_1.default({ margin: 30, size: 'A4' });
            let buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            // Load & Register Khmer Fonts
            const regularFontPath = path_1.default.join(process.cwd(), 'assets', 'fonts', 'Battambang-Regular.ttf');
            const boldFontPath = path_1.default.join(process.cwd(), 'assets', 'fonts', 'Battambang-Bold.ttf');
            try {
                doc.registerFont('Khmer-Regular', regularFontPath);
                doc.registerFont('Khmer-Bold', boldFontPath);
            }
            catch (err) {
                console.warn('Could not load Khmer fonts, falling back to defaults:', err.message);
            }
            // HEADER
            doc.font('Khmer-Bold').fontSize(20).text('INVOICE / វិក្កយបត្រ', { align: 'center' });
            doc.moveDown();
            // RENTAL INFO
            doc.font('Khmer-Regular').fontSize(12);
            doc.text(`Tenant Name: ${bill.rental?.ClientName || 'Unknown'}`);
            doc.text(`Room Number: ${bill.rental?.roomNumber || 'Unknown'}`);
            doc.text(`Billing Month: ${bill.month || 'Unknown'}`);
            doc.text(`Date Issued: ${new Date(bill.createdAt || Date.now()).toLocaleDateString()}`);
            doc.moveDown();
            // Determine unpaid charges
            const rentAmount = parseFloat(bill.rentAmount) || (bill.rental ? parseFloat(bill.rental.rentAmount) : 0) || 0;
            const elecAmount = bill.electricityStatus === 'Unpaid' ? parseFloat(bill.electricityAmount) || 0 : 0;
            const waterAmount = bill.waterStatus === 'Unpaid' ? parseFloat(bill.waterAmount) || 0 : 0;
            const amountToPay = rentAmount + elecAmount + waterAmount;
            const table = {
                title: "Charges Breakdown",
                headers: ["Description", "Amount (USD)", "Status"],
                rows: [
                    ["Room Rent", `$${rentAmount.toFixed(2)}`, "Unpaid"],
                    [`Electricity (${bill.currElectricityReading} - ${bill.prevElectricityReading})`, `$${(parseFloat(bill.electricityAmount) || 0).toFixed(2)}`, bill.electricityStatus || "Unpaid"],
                    [`Water (${bill.currWaterReading} - ${bill.prevWaterReading})`, `$${(parseFloat(bill.waterAmount) || 0).toFixed(2)}`, bill.waterStatus || "Unpaid"],
                    ["Total to Pay", `$${amountToPay.toFixed(2)}`, ""]
                ],
            };
            await doc.table(table, {
                prepareHeader: () => doc.font("Khmer-Bold").fontSize(12),
                prepareRow: () => doc.font("Khmer-Regular").fontSize(12)
            });
            // DYNAMIC KHQR
            let qrCodeDataURL = null;
            try {
                if (settings && settings.paymentBakongAccountId && amountToPay > 0) {
                    const reqData = new bakong_khqr_1.IndividualInfo(settings.paymentBakongAccountId, amountToPay, 'USD', `Room ${bill.rental?.roomNumber || 'Unknown'} - ${bill.month}`, 'Phnom Penh');
                    const khqr = new bakong_khqr_1.BakongKHQR();
                    const result = khqr.generateIndividual(reqData);
                    if (result && result.data && result.data.qr) {
                        qrCodeDataURL = await qrcode_1.default.toDataURL(result.data.qr);
                    }
                }
            }
            catch (e) {
                console.error("Failed to generate KHQR string for PDF:", e.message);
            }
            if (qrCodeDataURL) {
                doc.moveDown();
                doc.font('Khmer-Regular').fontSize(12).text('Scan to Pay (KHQR)', { align: 'center' });
                doc.image(qrCodeDataURL, { fit: [150, 150], align: 'center' });
            }
            else if (amountToPay === 0) {
                doc.moveDown();
                doc.font('Khmer-Bold').fontSize(14).fillColor('green').text('Fully Paid', { align: 'center' });
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateBillPdfBuffer = generateBillPdfBuffer;
