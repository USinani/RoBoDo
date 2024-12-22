import { pino } from 'pino';
export function createLogger(config) {
    return pino({
        level: config.logLevel,
        transport: {
            targets: [
                ...(config.isDebug
                    ? [
                        {
                            target: 'pino-pretty',
                            level: config.logLevel,
                            options: {
                                ignore: 'pid,hostname',
                                colorize: true,
                                translateTime: true,
                            },
                        },
                    ]
                    : [
                        {
                            target: 'pino/file',
                            level: config.logLevel,
                            options: {},
                        },
                    ]),
            ],
        },
    });
}
//# sourceMappingURL=logger.js.map