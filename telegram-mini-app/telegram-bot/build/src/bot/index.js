import { parseMode } from '@grammyjs/parse-mode';
import { Bot as TelegramBot } from 'grammy';
import { startFeature } from './start.js';
import { createContextConstructor } from './context.js';
function getSessionKey(ctx) {
    return ctx.chat?.id.toString();
}
export function createBot(token, dependencies, options = {}) {
    const { config, logger, } = dependencies;
    const bot = new TelegramBot(token, {
        ...options.botConfig,
        ContextConstructor: createContextConstructor({
            logger,
            config,
        }),
    });
    // Middlewares
    bot.api.config.use(parseMode('HTML'));
    // config.isPollingMode && protectedBot.use(sequentialize(getSessionKey))
    // config.isDebug && protectedBot.use(updateLogger())
    // bot.use(autoChatAction(bot.api))
    // bot.use(hydrateReply)
    // bot.use(hydrate())
    // bot.use(session({ getSessionKey, storage: options.botSessionStorage }))
    // Handlers
    bot.use(startFeature);
    return bot;
}
//# sourceMappingURL=index.js.map