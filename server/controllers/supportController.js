const SupportTicket = require('../models/supportTicket');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const telegramBot = require('../utils/telegramBot');

const supportController = {
    createTicket: async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            const ticket = await SupportTicket.create({
                name,
                email,
                subject,
                message
            });

            // Send notification to Telegram
            const notificationMsg = `
                🆕 *New Support Ticket*
                👤 *From:* ${name}
                📧 *Email:* ${email}
                🏷️ *Subject:* ${subject}
                📝 *Message:* ${message}
            `;
            telegramBot.sendMessage(notificationMsg);

            return successResponse(res, ticket, 'Support ticket created successfully', 201);
        } catch (error) {
            console.error('Create support ticket error:', error);
            return errorResponse(res, 'Failed to submit support ticket');
        }
    },

    getTickets: async (req, res) => {
        try {
            const tickets = await SupportTicket.findAll();
            return successResponse(res, tickets);
        } catch (error) {
            console.error('Get support tickets error:', error);
            return errorResponse(res, 'Failed to fetch support tickets');
        }
    },

    updateTicketStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const ticket = await SupportTicket.updateStatus(id, status);
            return successResponse(res, ticket, 'Ticket status updated successfully');
        } catch (error) {
            console.error('Update ticket status error:', error);
            return errorResponse(res, 'Failed to update ticket status');
        }
    },

    deleteTicket: async (req, res) => {
        try {
            const { id } = req.params;
            await SupportTicket.delete(id);
            return successResponse(res, null, 'Ticket deleted successfully');
        } catch (error) {
            console.error('Delete ticket error:', error);
            return errorResponse(res, 'Failed to delete ticket');
        }
    }
};

module.exports = supportController;
