#!/usr/bin/env tsx
import process from 'node:process';
import { ValiError, flatten } from 'valibot';
import { run } from '@grammyjs/runner';
import { createLogger } from './logger.js';
import { createBot } from './bot/index.js';
import { createConfig } from './config.js';
import { createServer, createServerManager } from './server/index.js';
async function startPolling(config) {
    const logger = createLogger(config);
    const bot = createBot(config.botToken, {
        config,
        logger,
    });
    let runner;
    // graceful shutdown
    onShutdown(async () => {
        logger.info('Shutdown');
        await runner?.stop();
    });
    await bot.init();
    // start bot
    runner = run(bot, {
        runner: {
            fetch: {
                allowed_updates: config.botAllowedUpdates,
            },
        },
    });
    logger.info({
        msg: 'Bot running...',
        username: bot.botInfo.username,
    });
}
async function startWebhook(config) {
    const logger = createLogger(config);
    const bot = createBot(config.botToken, {
        config,
        logger,
    });
    const server = createServer({
        bot,
        config,
        logger,
    });
    const serverManager = createServerManager(server, {
        host: config.serverHost,
        port: config.serverPort,
    });
    // graceful shutdown
    onShutdown(async () => {
        logger.info('Shutdown');
        await serverManager.stop();
    });
    // to prevent receiving updates before the bot is ready
    await bot.init();
    // start server
    const info = await serverManager.start();
    logger.info({
        msg: 'Server started',
        url: info.url,
    });
    // set webhook
    await bot.api.setWebhook(config.botWebhook, {
        allowed_updates: config.botAllowedUpdates,
        secret_token: config.botWebhookSecret,
    });
    logger.info({
        msg: 'Webhook was set',
        url: config.botWebhook,
    });
}
// Utils
function onShutdown(cleanUp) {
    let isShuttingDown = false;
    const handleShutdown = async () => {
        if (isShuttingDown)
            return;
        isShuttingDown = true;
        await cleanUp();
    };
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
}
function toCamelCase(str) {
    return str.toLowerCase().replace(/_([a-z])/g, (_match, p1) => p1.toUpperCase());
}
function convertKeysToCamelCase(obj) {
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelCaseKey = toCamelCase(key);
            result[camelCaseKey] = obj[key];
        }
    }
    return result;
}
async function startBot() {
    try {
        try {
            process.loadEnvFile();
        }
        catch {
            // No .env file found
        }
        // @ts-expect-error create config from environment variables
        const config = createConfig(convertKeysToCamelCase(process.env));
        if (config.isWebhookMode)
            await startWebhook(config);
        else if (config.isPollingMode)
            await startPolling(config);
    }
    catch (error) {
        if (error instanceof ValiError) {
            console.error('Config parsing error', flatten(error.issues));
        }
        else {
            console.error(error);
        }
        process.exit(1);
    }
}
// Handler for serverless environments
let botInstance = null;
export default async function handler(req, res) {
    try {
        process.loadEnvFile();
    }
    catch {
        // No .env file found
    }
    // @ts-expect-error create config from environment variables
    const config = createConfig(convertKeysToCamelCase(process.env));
    if (config.isWebhookMode) {
        const logger = createLogger(config);
        const bot = createBot(config.botToken, { config, logger });
        await bot.init();
        const server = createServer({ bot, config, logger });
        await server.fetch(req);
        res.status(200).send('OK');
    }
    else if (config.isPollingMode) {
        if (!botInstance) {
            const logger = createLogger(config);
            botInstance = createBot(config.botToken, { config, logger });
            await botInstance.init();
            // Start the bot in polling mode without awaiting
            startPolling(config).catch(error => {
                console.error('Error in polling mode:', error);
            });
        }
        res.status(200).send('Bot is running in polling mode');
    }
    else {
        res.status(400).send('Invalid bot configuration');
    }
}
// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startBot();
}
//# sourceMappingURL=main.js.map