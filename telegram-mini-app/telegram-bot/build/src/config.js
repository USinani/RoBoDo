import * as v from 'valibot';
import { API_CONSTANTS } from 'grammy';
const baseConfigSchema = v.object({
    debug: v.optional(v.pipe(v.string(), v.transform(JSON.parse), v.boolean()), 'false'),
    logLevel: v.optional(v.pipe(v.string(), v.picklist(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])), 'info'),
    botToken: v.pipe(v.string(), v.regex(/^\d+:[\w-]+$/, 'Invalid token')),
    botAllowedUpdates: v.optional(v.pipe(v.string(), v.transform(JSON.parse), v.array(v.picklist(API_CONSTANTS.ALL_UPDATE_TYPES))), '[]'),
    botAdmins: v.optional(v.pipe(v.string(), v.transform(JSON.parse), v.array(v.number())), '[]'),
});
const configSchema = v.variant('botMode', [
    // polling config
    v.pipe(v.object({
        botMode: v.literal('polling'),
        ...baseConfigSchema.entries,
    }), v.transform(input => ({
        ...input,
        isDebug: input.debug,
        isWebhookMode: false,
        isPollingMode: true,
    }))),
    // webhook config
    v.pipe(v.object({
        botMode: v.literal('webhook'),
        ...baseConfigSchema.entries,
        botWebhook: v.pipe(v.string(), v.url()),
        botWebhookSecret: v.pipe(v.string(), v.minLength(12)),
        serverHost: v.optional(v.string(), '0.0.0.0'),
        serverPort: v.optional(v.pipe(v.string(), v.transform(Number), v.number()), '80'),
    }), v.transform(input => ({
        ...input,
        isDebug: input.debug,
        isWebhookMode: true,
        isPollingMode: false,
    }))),
]);
export function createConfig(input) {
    return v.parse(configSchema, input);
}
//# sourceMappingURL=config.js.map