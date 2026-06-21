"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supportController_1 = __importDefault(require("../controllers/supportController"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public route for creating tickets
router.post('/', supportController_1.default.createTicket);
// Protected routes for managing tickets
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN'), supportController_1.default.getTickets);
router.patch('/:id/status', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN'), supportController_1.default.updateTicketStatus);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN'), supportController_1.default.deleteTicket);
exports.default = router;
