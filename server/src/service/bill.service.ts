import Bill from '../models/bill';
import * as telegramSender from '../utils/telegramSender';
import SystemSetting from '../models/systemSetting';
import { generateBillPdfBuffer } from '../utils/pdfGenerator';

const triggerUnpaidAlertIfNeeded = async (bill: any, isNew = false): Promise<void> => {
    if (!bill) return;
    const unpaidElectricity = bill.electricityStatus === 'Unpaid';
    const unpaidWater = bill.waterStatus === 'Unpaid';

    if (unpaidElectricity || unpaidWater) {
        const settings = await SystemSetting.getSettings();
        if (!settings || !settings.telegramBotToken || !settings.telegramChatId) {
            return; // Not configured
        }

        const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';

        const clientName = bill.rental?.ClientName || (lang === 'km' ? 'មិនស្គាល់អតិថិជន' : 'Unknown Client');
        const roomStr = bill.rental?.roomNumber || (lang === 'km' ? 'មិនស្គាល់បន្ទប់' : 'Unknown Room');

        let message = '';
        if (lang === 'km') {
            message = `🚨 <b>ការដាស់តឿន៖ ការប្រើប្រាស់មិនទាន់បង់ប្រាក់</b>\n\n`;
            if (isNew) {
                message += `វិក្កយបត្រថ្មីមួយត្រូវបានបង្កើតដោយមានការគិតប្រាក់មិនទាន់បានបង់។\n`;
            } else {
                message += `វិក្កយបត្រត្រូវបានកែប្រែ ហើយស្ថានភាពទឹក/ភ្លើងមិនទាន់បានបង់។\n`;
            }

            message += `\n👤 <b>អតិថិជន:</b> ${clientName}`;
            message += `\n🚪 <b>បន្ទប់:</b> ${roomStr}`;
            message += `\n📅 <b>វិក្កយបត្រខែ:</b> ${bill.month}`;

            if (unpaidElectricity) {
                message += `\n⚡ <b>អគ្គិសនី:</b> មិនទាន់បង់ ($${bill.electricityAmount || 0})`;
            }
            if (unpaidWater) {
                message += `\n💧 <b>ទឹកស្អាត:</b> មិនទាន់បង់ ($${bill.waterAmount || 0})`;
            }
            message += `\n\nសូមតាមដានជាមួយអតិថិជន។`;

        } else {
            message = `🚨 <b>Rental Alert: Unpaid Utilities</b>\n\n`;
            if (isNew) {
                message += `A new bill was generated with outstanding charges.\n`;
            } else {
                message += `A bill has been updated and utilities are marked as unpaid.\n`;
            }

            message += `\n👤 <b>Client:</b> ${clientName}`;
            message += `\n🚪 <b>Room:</b> ${roomStr}`;
            message += `\n📅 <b>Billing Month:</b> ${bill.month}`;

            if (unpaidElectricity) {
                message += `\n⚡ <b>Electricity:</b> Unpaid ($${bill.electricityAmount || 0})`;
            }
            if (unpaidWater) {
                message += `\n💧 <b>Water:</b> Unpaid ($${bill.waterAmount || 0})`;
            }
            message += `\n\nPlease follow up with the customer.`;
        }

        // Send to Admin Group
        telegramSender.sendMessage(settings.telegramBotToken, settings.telegramChatId, message).catch(console.error);

        // Send to individual tenant if they have a telegramChatId
        if (bill.rental?.telegramChatId) {
            let tenantMessage = '';
            if (lang === 'km') {
                tenantMessage = `📢 <b>សួស្តី ${clientName}!</b>\n\nនេះគឺជាការរំលឹកអំពីវិក្កយបត្រសម្រាប់ខែ <b>${bill.month}</b> បន្ទប់ <b>${roomStr}</b> ។\n`;
                if (unpaidElectricity) tenantMessage += `\n⚡ <b>អគ្គិសនី:</b> មិនទាន់បង់ ($${bill.electricityAmount || 0})`;
                if (unpaidWater) tenantMessage += `\n💧 <b>ទឹកស្អាត:</b> មិនទាន់បង់ ($${bill.waterAmount || 0})`;
                tenantMessage += `\n\nសូមធ្វើការទូទាត់ឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន។ សូមអរគុណ!`;
            } else {
                tenantMessage = `📢 <b>Hello ${clientName}!</b>\n\nThis is a reminder for your bill of <b>${bill.month}</b> for Room <b>${roomStr}</b>.\n`;
                if (unpaidElectricity) tenantMessage += `\n⚡ <b>Electricity:</b> Unpaid ($${bill.electricityAmount || 0})`;
                if (unpaidWater) tenantMessage += `\n💧 <b>Water:</b> Unpaid ($${bill.waterAmount || 0})`;
                tenantMessage += `\n\nPlease proceed with the payment at your earliest convenience. Thank you!`;
            }
            telegramSender.sendMessage(settings.telegramBotToken, bill.rental.telegramChatId, tenantMessage).catch(console.error);
        }
    }
};

const autoSendInvoiceToTenant = async (bill: any): Promise<void> => {
    try {
        if (!bill || !bill.rental || !bill.rental.telegramChatId) return;
        const settings = await SystemSetting.getSettings();
        if (!settings || !settings.telegramBotToken) return;

        console.log(`Generating PDF invoice for bill ${bill.id} to send to ${bill.rental.ClientName}...`);
        const pdfBuffer = await generateBillPdfBuffer(bill, settings);
        const fileName = `Invoice_Room_${bill.rental.roomNumber}_${bill.month}.pdf`;
        const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';

        let caption = '';
        if (lang === 'km') {
            caption = `📄 <b>វិក្កយបត្រប្រចាំខែ: ${bill.month}</b>\nបន្ទប់: ${bill.rental.roomNumber}\n\nសូមមើលឯកសារភ្ជាប់សម្រាប់ព័ត៌មានលម្អិត។`;
        } else {
            caption = `📄 <b>Monthly Invoice: ${bill.month}</b>\nRoom: ${bill.rental.roomNumber}\n\nPlease find the attached PDF invoice for your details.`;
        }

        await telegramSender.sendDocument(
            settings.telegramBotToken,
            bill.rental.telegramChatId,
            pdfBuffer,
            fileName,
            caption
        );
    } catch (error) {
        console.error('Failed to auto-send invoice to tenant:', error);
    }
};

export const getAllBills = async (): Promise<any[]> => {
    return await Bill.findAll();
};

export const getBillById = async (id: number | string): Promise<any> => {
    const bill = await Bill.findById(id);
    if (!bill) {
        throw new Error('Bill not found');
    }
    return bill;
};

export const createBill = async (billData: any): Promise<any> => {
    const bill = await Bill.create(billData);
    await triggerUnpaidAlertIfNeeded(bill, true);
    await autoSendInvoiceToTenant(bill);
    return bill;
};

export const updateBill = async (id: number | string, billData: any): Promise<any> => {
    try {
        const bill = await Bill.update(id, billData);
        if (bill === null) {
            throw new Error('No valid fields to update');
        }
        await triggerUnpaidAlertIfNeeded(bill, false);
        await autoSendInvoiceToTenant(bill);
        return bill;
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error('Bill not found');
        }
        throw error;
    }
};

export const deleteBill = async (id: number | string): Promise<any> => {
    const deleted = await Bill.delete(id);
    if (!deleted) {
        throw new Error('Bill not found');
    }
    return deleted;
};
