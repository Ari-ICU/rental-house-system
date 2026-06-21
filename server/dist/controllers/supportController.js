"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supportTicket_1 = __importDefault(require("../models/supportTicket"));
const apiResponse_1 = require("../utils/apiResponse");
const telegramBot = __importStar(require("../utils/telegramBot"));
const supportController = {
    createTicket: async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;
            const ticket = await supportTicket_1.default.create({
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
            return (0, apiResponse_1.successResponse)(res, ticket, 'Support ticket created successfully', 201);
        }
        catch (error) {
            console.error('Create support ticket error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Failed to submit support ticket');
        }
    },
    getTickets: async (req, res) => {
        try {
            const tickets = await supportTicket_1.default.findAll();
            return (0, apiResponse_1.successResponse)(res, tickets);
        }
        catch (error) {
            console.error('Get support tickets error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch support tickets');
        }
    },
    updateTicketStatus: async (req, res) => {
        try {
            const id = req.params.id;
            const { status } = req.body;
            const ticket = await supportTicket_1.default.updateStatus(id, status);
            return (0, apiResponse_1.successResponse)(res, ticket, 'Ticket status updated successfully');
        }
        catch (error) {
            console.error('Update ticket status error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Failed to update ticket status');
        }
    },
    deleteTicket: async (req, res) => {
        try {
            const id = req.params.id;
            await supportTicket_1.default.delete(id);
            return (0, apiResponse_1.successResponse)(res, null, 'Ticket deleted successfully');
        }
        catch (error) {
            console.error('Delete ticket error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Failed to delete ticket');
        }
    }
};
exports.default = supportController;
