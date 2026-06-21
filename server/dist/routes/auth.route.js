"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// router.post('/register', authController.register); // Disabled for security (admin only)
router.post('/login', auth_controller_1.default.login);
router.post('/logout', auth_controller_1.default.logout);
router.get('/me', auth_middleware_1.protect, auth_controller_1.default.getMe);
exports.default = router;
