"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = configCommand;
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../core/context");
const config_1 = require("../utils/config");
const VALID_KEYS = [
    "defaultOutput",
    "autoGitCapture",
    "recentCommitCount",
    "defaultLogCount",
    "watchInterval",
    "autoHook",
    "aiProvider",
    "aiModel",
    "aiApiKey",
];
async function configCommand(action, key, value) {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        const config = await (0, config_1.loadConfig)();
        if (!action || action === "list") {
            console.log(chalk_1.default.bold("\nDevContext Configuration:\n"));
            for (const [k, v] of Object.entries(config)) {
                if (k === "aiApiKey" && v) {
                    console.log(`  ${chalk_1.default.cyan(k)}: ${chalk_1.default.gray("****" + String(v).slice(-4))}`);
                }
                else {
                    console.log(`  ${chalk_1.default.cyan(k)}: ${chalk_1.default.white(String(v))}`);
                }
            }
            console.log();
            return;
        }
        if (action === "get") {
            if (!key) {
                console.log(chalk_1.default.red("✗ Usage: devctx config get <key>"));
                return;
            }
            if (!VALID_KEYS.includes(key)) {
                console.log(chalk_1.default.red(`✗ Unknown config key: ${key}`));
                console.log(chalk_1.default.gray(`  Valid keys: ${VALID_KEYS.join(", ")}`));
                return;
            }
            const val = config[key];
            console.log(`${chalk_1.default.cyan(key)}: ${chalk_1.default.white(String(val ?? "(not set)"))}`);
            return;
        }
        if (action === "set") {
            if (!key || value === undefined) {
                console.log(chalk_1.default.red("✗ Usage: devctx config set <key> <value>"));
                return;
            }
            if (!VALID_KEYS.includes(key)) {
                console.log(chalk_1.default.red(`✗ Unknown config key: ${key}`));
                console.log(chalk_1.default.gray(`  Valid keys: ${VALID_KEYS.join(", ")}`));
                return;
            }
            // Type coercion
            let typedValue = value;
            if (value === "true")
                typedValue = true;
            else if (value === "false")
                typedValue = false;
            else if (!isNaN(Number(value)) && key !== "aiApiKey" && key !== "aiProvider" && key !== "aiModel") {
                typedValue = Number(value);
            }
            await (0, config_1.saveConfig)({ [key]: typedValue });
            console.log(chalk_1.default.green(`✓ Set ${chalk_1.default.bold(key)} = ${typedValue}`));
            return;
        }
        console.log(chalk_1.default.red(`✗ Unknown action: ${action}`));
        console.log(chalk_1.default.gray("  Usage: devctx config [list|get|set] [key] [value]"));
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
