import PDFDocument from 'pdfkit-table';
import qrcode from 'qrcode';
import { BakongKHQR, IndividualInfo } from 'bakong-khqr';
import path from 'path';

export const generateBillPdfBuffer = async (bill: any, settings: any): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            let buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Load & Register Khmer Fonts
            const regularFontPath = path.join(process.cwd(), 'assets', 'fonts', 'Battambang-Regular.ttf');
            const boldFontPath = path.join(process.cwd(), 'assets', 'fonts', 'Battambang-Bold.ttf');

            try {
                doc.registerFont('Khmer-Regular', regularFontPath);
                doc.registerFont('Khmer-Bold', boldFontPath);
            } catch (err: any) {
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
            } as any);

            // DYNAMIC KHQR
            let qrCodeDataURL: string | null = null;
            try {
                if (settings && settings.paymentBakongAccountId && amountToPay > 0) {
                    const reqData = new IndividualInfo(
                        settings.paymentBakongAccountId,
                        amountToPay,
                        'USD',
                        `Room ${bill.rental?.roomNumber || 'Unknown'} - ${bill.month}`,
                        'Phnom Penh'
                    );

                    const khqr = new BakongKHQR();
                    const result = khqr.generateIndividual(reqData);

                    if (result && result.data && result.data.qr) {
                        qrCodeDataURL = await qrcode.toDataURL(result.data.qr);
                    }
                }
            } catch (e: any) {
                console.error("Failed to generate KHQR string for PDF:", e.message);
            }

            if (qrCodeDataURL) {
                doc.moveDown();
                doc.font('Khmer-Regular').fontSize(12).text('Scan to Pay (KHQR)', { align: 'center' });
                doc.image(qrCodeDataURL, { fit: [150, 150], align: 'center' } as any);
            } else if (amountToPay === 0) {
                doc.moveDown();
                doc.font('Khmer-Bold').fontSize(14).fillColor('green' as any).text('Fully Paid', { align: 'center' });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
