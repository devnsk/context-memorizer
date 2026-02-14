"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToClipboard = copyToClipboard;
const clipboardy_1 = __importDefault(require("clipboardy"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * Copy text to the system clipboard.
 * Falls back gracefully in headless / CI environments.
 */
async function copyToClipboard(text) {
    try {
        await clipboardy_1.default.write(text);
        return true;
    }
    catch {
        // Headless environment — clipboard not available
        console.log(chalk_1.default.yellow("⚠ Clipboard not available (headless environment?). Use --stdout instead."));
        return false;
    }
}
