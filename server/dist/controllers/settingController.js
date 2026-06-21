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
exports.updateSettings = exports.getSettings = void 0;
const systemSetting_1 = __importDefault(require("../models/systemSetting"));
const apiResponse_1 = require("../utils/apiResponse");
const telegramBot = __importStar(require("../utils/telegramBot"));
const getSettings = async (req, res) => {
    try {
        const settings = await systemSetting_1.default.getSettings();
        return (0, apiResponse_1.successResponse)(res, settings, 'Settings fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch settings', error);
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const updatedSettings = await systemSetting_1.default.updateSettings(req.body);
        // Refresh Telegram Bot if settings changed
        telegramBot.initializeBot();
        return (0, apiResponse_1.successResponse)(res, updatedSettings, 'Settings updated successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to update settings', error);
    }
};
exports.updateSettings = updateSettings;
