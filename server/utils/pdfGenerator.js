const PDFDocument = require('pdfkit-table');
const qrcode = require('qrcode');
const { BakongKHQR, IndividualInfo } = require('bakong-khqr');

const generateBillPdfBuffer = async (bill, settings) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // HEADER
            doc.fontSize(20).text('INVOICE / វិក្កយបត្រ', { align: 'center' });
            doc.moveDown();

            // RENTAL INFO
            doc.fontSize(12);
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
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
                prepareRow: () => doc.font("Helvetica").fontSize(12)
            });

            // DYNAMIC KHQR
            let qrCodeDataURL = null;
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
            } catch (e) {
                console.error("Failed to generate KHQR string for PDF:", e.message);
            }

            if (qrCodeDataURL) {
                doc.moveDown();
                doc.fontSize(12).text('Scan to Pay (KHQR)', { align: 'center' });
                doc.image(qrCodeDataURL, { fit: [150, 150], align: 'center' });
            } else if (amountToPay === 0) {
                doc.moveDown();
                doc.fontSize(14).fillColor('green').text('Fully Paid', { align: 'center' });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateBillPdfBuffer
};
